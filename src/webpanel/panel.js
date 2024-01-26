// Packages
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

// Functions
const { logBot } = require('../utils/logger.js');
const { executeCommand } = require('../handlers/command.handler.js');
const { getTabCompletions } = require('../handlers/tabcomplete.handler.js');


module.exports = {
    /**
     * @param {import('../index.js').Main} main 
     */
    setup: (main) => {
        const {port} = main.config.values['online-panel'];

        const app = express();
        const server = http.createServer(app);
        const io = new Server(server);

        app.use(express.static(__dirname + '/public/'));

        app.get('/*', (req, res) => {
            res.redirect("/");
        });
        

        server.on("error", (error) => {
            logBot(`An error occured in online panel server. Error message: ${error}`);
        });

        server.on("close", () => {
            logBot("&cOnline panel server has been closed!");
        });

        main.panel = {
            io: io,
            app: app,
            server: server
        };
        
        server.listen(port, () => {
            logBot(`&eOnline panel is running on port &6${port}&e!`);
        });

        io.on("connection", (socket) =>{
            socket.on("send-command", (data) => {
                const {command} = data;
                executeCommand(command.trim());
            });

            let lastCompletionTimestamp = 0;
            socket.on("get-tab-completions", async (data) => {
                const {command, timestamp} = data;
                
                lastCompletionTimestamp = timestamp;
                const completions = await getTabCompletions(main, command, socket, timestamp);

                if (lastCompletionTimestamp > timestamp) return;
                socket.emit("tab-completions", completions);
            });

            socket.on("get-last-logs", () => {
                if (!main) return;

                const {database} = main;
                if (!database) return;

                const {messagesLimitType, messagesLimit} = main.vars.onlinePanel;

                let query;
                if (messagesLimitType === "count") {
                    query = `SELECT * FROM messages ORDER BY timestamp DESC LIMIT ${messagesLimit}`;
                } else if (messagesLimitType === "time") {
                    query = `SELECT * FROM messages WHERE timestamp>${Date.now() - messagesLimit * 60 * 1000}`;
                } else if (messagesLimitType === "all") {
                    query = "SELECT * FROM messages";
                }

                const messages = database.prepare(query).all();
                if (messagesLimitType === "count") messages.reverse();

                socket.emit("logs-data", {messages});
            });
        });
    }
}
