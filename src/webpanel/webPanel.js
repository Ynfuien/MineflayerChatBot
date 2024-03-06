// Packages
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

// Functions
const { logBot } = require('../utils/logger.js');
const { executeCommand } = require('../handlers/command.handler.js');
const { getTabCompletions } = require('../handlers/tabcomplete.handler.js');

/** @type {import('../index.js').Main} */
let main;

const self = module.exports = {
    /**
     * @param {import('../index.js').Main} main 
     */
    setup: (_main) => {
        main = _main;
        
        const {port} = main.config.values['online-panel'];

        const app = express();
        const server = http.createServer(app);
        const io = new Server(server);
        
        main.webPanel = {io, app, server};

        app.use(express.static(__dirname + '/public/'));

        app.get('/*', (req, res) => {
            res.redirect("/");
        });
        

        server.on("error", (error) => {
            logBot(`&cAn error occured in online panel server. Error message: ${error}`);
        });

        server.on("close", () => {
            logBot("&cOnline panel server has been closed!");
        });

        
        server.listen(port, () => {
            logBot(`&eOnline panel is running on port &6${port}&e!`);

            self.playerListUpdate(main, true);
        });

        io.on("connection", (socket) => {
            if (main.bot) {
                self.playerListUpdate(main);
                const { sidebar } = main.bot.scoreboard;
                self.scoreboardUpdate(sidebar ? sidebar : null);
            }

            socket.emit("config", {
                chatPatterns: main.config.values['online-panel']['chat-patterns']
            });

            socket.on("execute-command", (data) => {
                const {command} = data;
                executeCommand(command.trim());
            });

            let lastCompletionTimestamp = 0;
            socket.on("get-tab-completions", async (data) => {
                const {command, timestamp} = data;
                
                lastCompletionTimestamp = timestamp;
                const completions = await getTabCompletions(main, command);

                if (lastCompletionTimestamp > timestamp) return;
                socket.emit("tab-completions", completions);
            });

            socket.on("get-last-logs", () => {
                if (!main) return;

                const {database} = main;
                if (!database) return;

                const {messagesLimitType, messagesLimit} = main.vars.onlinePanel;

                let query = "SELECT * FROM messages ";
                if (messagesLimitType === "count") {
                    query += ` ORDER BY timestamp DESC LIMIT ${messagesLimit}`;
                } else if (messagesLimitType === "time") {
                    query += ` WHERE timestamp>${Date.now() - messagesLimit * 60 * 1000} ORDER BY timestamp ASC`;
                } else if (messagesLimitType === "all") {
                    query += " ORDER BY timestamp ASC";
                }

                const messages = database.prepare(query).all();
                if (messagesLimitType === "count") messages.reverse();

                socket.emit("logs-data", {messages});
            });
        });
    },

    /**
     * @param {import('prismarine-chat').ChatMessage} message 
     */
    sendActionBar(message) {
        const { bot } = main;
        if (!bot) return;
        
        const { io } = main.webPanel;

        io.emit("action-bar", {
            message: message.toMotd(),
            timestamp: Date.now()
        });
    },

    /**
     * @param {import('prismarine-chat').ChatMessage} header 
     * @param {import('prismarine-chat').ChatMessage} footer 
     */
    tabListUpdate(header, footer) {
        const { bot } = main;
        if (!bot) return;
        
        const { io } = main.webPanel;

        io.emit("tab-list", {
            header: header ? header.toMotd() : "",
            footer: footer ? footer.toMotd() : "",
            timestamp: Date.now()
        });
    },

    /**
     * 
     * @param {import('mineflayer').ScoreBoard} scoreboard 
     * @returns 
     */
    scoreboardUpdate(scoreboard) {
        const { bot } = main;
        if (!bot) return;
        
        const { io } = main.webPanel;

        // Clear scoreboard
        if (scoreboard === null) {
            io.emit("scoreboard", {
                scoreboard: null,
                timestamp: Date.now()
            });

            return;
        }

        let { title } = scoreboard;
        if (title &&  typeof title !== "string") title = title.toMotd();

        const result = {
            name: scoreboard.name,
            title,
            items: []
        };

        for (const item of scoreboard.items) {
            result.items.push({
                name: item.name,
                value: item.value,
                displayName: item.displayName.toMotd()
            });
        }

        io.emit("scoreboard", {
            scoreboard: result,
            timestamp: Date.now()
        });
    },
    

    /**
     * @param {import('../index.js').Main} main 
     */
    async playerListUpdate(main, interval = false) {
        const { tabList } = main.vars.onlinePanel;
        if (interval) setTimeout(() => { self.playerListUpdate(main, true) }, tabList.playersInterval);
        
        if (!tabList.enabled) return;

        const { bot } = main;
        if (!bot) return;
        
        const { io } = main.webPanel;

        io.emit("player-list", {
            list: getSortedPlayerList(bot),
            timestamp: Date.now()
        });
    }
}


/**
 * @param {import('mineflayer').Bot} bot
 */
function getSortedPlayerList(bot) {
    const {players} = bot;
    const listScoreboard = bot.scoreboard?.list;
    
    const teams = getPlayerTeams(bot);
    const sortedTeams = Object.keys(teams.custom).sort();

    const list = [];
    const spectators = [];

    addPlayers(teams.none);

    for (const teamName of sortedTeams) {
        const teamPlayers = teams.custom[teamName];

        addPlayers(teamPlayers);
    }

    
    function addPlayers(playerList) {
        for (const username of playerList) {
            const player = players[username];
            const {displayName, ping, gamemode} = player;

            let scoreboardValue = null;
            if (listScoreboard) {
                const playerValues = listScoreboard.itemsMap[username];
                if (playerValues) scoreboardValue = playerValues.value;
            }

            const playerObject = {
                username,
                displayName: displayName.toMotd(),
                ping,
                gamemode,
                scoreboardValue
            };

            // Spectator
            if (gamemode === 3) {
                spectators.push(playerObject);
                continue;
            }

            list.push(playerObject);
        }
    }

    return list.concat(spectators);
}

/**
 * @param {import('mineflayer').Bot} bot
 * @returns {{custom: Object.<string, string[]>, none: string[]}}
 */
function getPlayerTeams(bot) {
    const {teamMap, players} = bot;
    
    const teams = {};
    const none = [];

    for (const username in players) {
        const team = teamMap[username];
        
        if (!team) {
            none.push(username);
            continue;
        }

        const teamName = team.team;
        if (!(teamName in teams)) teams[teamName] = [];

        teams[teamName].push(username);
    }

    for (const teamName in teams) {
        teams[teamName].sort((a, b) => a.toLowerCase() < b.toLowerCase() ? -1 : 1);
    }
    none.sort((a, b) => a.toLowerCase() < b.toLowerCase() ? -1 : 1);

    return {custom: teams, none};
}