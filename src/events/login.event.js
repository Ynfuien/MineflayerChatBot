const {logBot} = require('../utils/logger.js');
const {executeCommand} = require('../handlers/command.handler.js');

module.exports = {
    name: "login",
    enable: false,

    run (main) {
        const {bot, temp, config} = main;

        main.temp.bot.onServer = false;
        setTimeout(() => {
            main.temp.bot.onServer = true;

            const players = bot.players;
            const usernames = Object.keys(players).map(player => players[player].displayName);
            
            usernames.sort();
            logBot("&5Players in game:");
            logBot("§d" + usernames.join("§7, §d"), '§');
        }, 1500);

        if (temp.bot.joined) {
            logBot("&dBot switched subserver!");
            return;
        }

        main.temp.bot.joined = true;
        logBot("&dBot joined the server!");
        logBot(`&5Username: &f${bot.username}`);
        logBot(`&5Version: &f${bot.version}`);
        logBot(`&5Host: &f${config.server.host}`);

        let botRunning = true;
        for (const command of main.temp.config.onJoin.commands) {
            let split = command.split(':');
            const timeout = parseInt(split.shift());

            const text = split.join(':');
            console.log({timeout, text});

            setTimeout(() => {
                if (!main.bot) botRunning = false;
                if (!botRunning) return;

                console.log({timeout, text});
                executeCommand(text);
            }, timeout);
        }
    }
}