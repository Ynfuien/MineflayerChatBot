const {logBot, log} = require('../utils/logger.js');
const {executeCommand} = require('../handlers/command.handler.js');
const { ChatMessage } = require('../utils/chat-message.js');

module.exports = {
    name: "login",
    enable: true,

    /**
     * @param {import('../types.js').Main} main
     */
    run (main) {
        const {bot, config, vars} = main;

        // Disable logging 'playerJoined' event, while joining.
        main.vars.bot.logPlayers = false;
        setTimeout(() => {
            main.vars.bot.logPlayers = true;

            // Aand log all players at once
            const players = bot.players;
            /** @type {string[]} */
            const displayNames = [];
            for (const username in players) {
                if (!username.match(/^[a-z0-9_]{3,16}$/gi)) continue;

                const displayName = players[username].displayName;
                displayNames.push(new ChatMessage(displayName.json).toLegacy());
            }

            const message = ChatMessage.fromLegacy("§d" + displayNames.join("§7, §d"));
            logBot(`&5Players in game &7(${displayNames.length})&5:`);
            log(message);
        }, 1500);

        
        if (vars.bot.joined) {
            logBot("&dBot switched subserver!");
            return;
        }

        vars.bot.joined = true;
        logBot("&dBot joined the server!");
        logBot(`&5Username: &f${bot.username}`);
        logBot(`&5Version: &f${bot.version}`);
        logBot(`&5Host: &f${config.values['bot-options'].host}`);
        

        const timeouts = [];
        for (const command of main.vars.onJoin.commands) {
            const timeout = setTimeout(() => {
                // Cancel all timeouts if bot is off
                if (!main.bot) {
                    for (const timeout of timeouts) clearTimeout(timeout);
                    return;
                }

                executeCommand(command);
            }, command.timeout);

            timeouts.push(timeout);
        }
    }
}