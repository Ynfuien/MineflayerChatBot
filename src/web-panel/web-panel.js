// Packages
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

// Functions
const { logBot, devLog } = require('../utils/logger.js');
const { executeCommand } = require('../handlers/command.handler.js');
const { getTabCompletions } = require('../handlers/tabcomplete.handler.js');
const { ChatMessage } = require('../utils/chat-message.js');

/** @type {import('../types.js').Main} */
let main;

const lastTabList = { header: null, footer: null };

const self = module.exports = {
    /**
     * @param {import('../types.js').Main} main 
     */
    setup: (_main) => {
        main = _main;

        const { port } = main.config.values['online-panel'];

        const app = express();
        const server = http.createServer(app);
        const io = new Server(server);

        main.webPanel = { io, app, server };

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

            self.playerListUpdate(true);
        });

        io.on("connection", (socket) => {
            const { bot } = main;
            if (bot) {
                self.tabListUpdate(lastTabList.header, lastTabList.footer);
                self.playerListUpdate();
                const { sidebar } = bot.duckTape.scoreboards.byPosition;
                self.scoreboardUpdate(sidebar);

                self.updateLanguage();
            }

            socket.emit("config", {
                messagePrefixes: main.config.values['online-panel']['message-prefixes']
            });

            socket.on("execute-command", (data) => {
                const { command } = data;
                executeCommand(command.trim());
            });

            let lastCompletionTimestamp = 0;
            socket.on("get-tab-completions", async (data) => {
                const { command, timestamp } = data;

                lastCompletionTimestamp = timestamp;
                const completions = await getTabCompletions(main, command);

                if (lastCompletionTimestamp > timestamp) return;
                socket.emit("tab-completions", completions);
            });

            socket.on("get-last-logs", () => {
                if (!main) return;

                const { database } = main;
                if (!database) return;

                const { messagesLimitType, messagesLimit } = main.vars.onlinePanel;

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

                for (const message of messages) message.message = JSON.parse(message.message);

                socket.emit("logs-data", { messages });
            });
        });
    },

    updateLanguage() {
        if (!main) return;
        const { bot } = main;
        if (!bot) return;

        const { io } = main.webPanel;
        if (!io) return;

        io.emit("language", {
            language: bot.registry.language
        });
    },

    /**
     * @param {ChatMessage} message 
     */
    sendActionBar(message) {
        const { bot } = main;
        if (!bot) return;

        const { io } = main.webPanel;

        io.emit("action-bar", {
            message,
            timestamp: Date.now()
        });
    },

    /**
     * @param {ChatMessage?} header
     * @param {ChatMessage?} footer
     */
    tabListUpdate(header, footer) {
        const { bot } = main;
        if (!bot) return;

        lastTabList.header = header;
        lastTabList.footer = footer;

        const { io } = main.webPanel;

        io.emit("tab-list", {
            header,
            footer,
            timestamp: Date.now()
        });
    },

    /**
     * 
     * @param {import('../duck-tapes/scoreboard.tape.js').Scoreboard} scoreboard 
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

        const { name, displayText, numberFormat, styling } = scoreboard;
        const result = {
            name,
            displayText: displayText,
            numberFormat,
            styling: styling,
            items: []
        };

        const items = scoreboard.getItemArray();
        for (const item of items) {
            result.items.push({
                name: item.name,
                value: item.value,
                numberFormat: item.numberFormat,
                styling: item.styling,
                displayName: item.getFinalDisplayText()
            });
        }

        // return;
        io.emit("scoreboard", {
            scoreboard: result,
            timestamp: Date.now()
        });
    },

    async playerListUpdate(interval = false) {
        if (interval) {
            const intervalValue = main.config.values['online-panel'].features['player-list'].interval;
            setTimeout(() => { self.playerListUpdate(true) }, typeof intervalValue === "number" ? intervalValue : 100);
        }

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
 * @param {import('../types.js').TapedBot} bot
 */
function getSortedPlayerList(bot) {
    const { players } = bot;
    const listScoreboard = bot.duckTape.scoreboards.byPosition.list;

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
            const { displayName, ping, gamemode } = player;
            const team = bot.teamMap[username];

            let score = null;
            if (listScoreboard) {
                const playerScore = listScoreboard.items[username];
                if (playerScore) {
                    const styling = playerScore.styling ?? listScoreboard.styling;
                    score = {
                        value: playerScore.value,
                        numberFormat: playerScore.numberFormat ?? listScoreboard.numberFormat,
                        styling: styling
                    };
                }
            }

            const finalDisplayName = new ChatMessage(displayName.json);
            if (team) finalDisplayName.color = team.color;

            const playerObject = {
                username,
                displayName: finalDisplayName,
                ping,
                gamemode,
                score
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
 * @param {import('../types.js').TapedBot} bot
 * @returns {{custom: Object.<string, string[]>, none: string[]}}
 */
function getPlayerTeams(bot) {
    const { teamMap, players } = bot;

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

    return { custom: teams, none };
}