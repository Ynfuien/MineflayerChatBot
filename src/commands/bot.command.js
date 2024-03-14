const { startBot } = require("../utils/bot-manager.js");
const { logBot } = require("../utils/logger.js");

module.exports = {
    name: "bot",
    enable: true,
    usage: "<on | off | restart>",
    description: "Starts, stops or restarts the bot.",

    /**
     * @param {import('../types.js').Main} main
     * @param {string[]} args
     */
    run(main, args) {
        const { bot } = main;

        if (args.length === 0) return false;
        const arg = args[0].toLowerCase();

        if (["off", "stop", "quit"].includes(arg)) {
            if (!bot) return logBot("&cBot is already off!");

            logBot("&bTurning bot &coff&b..");
            bot.end();
            main.vars.bot.stop = true;
            return;
        }

        if (["on", "start", "join"].includes(arg)) {
            if (bot) return logBot("&cBot is already on!");

            logBot("&bTurning bot &aon&b..");
            startBot(main);
            return;
        }

        if (["restart", "rejoin"].includes(arg)) {
            if (!bot) {
                logBot("&bTurning bot &aon&b..");
                startBot(main);
                return;
            }

            logBot("&bTurning bot &coff&b..");
            bot.end();
            main.vars.bot.restart = true;
            return;
        }

        return false;
    },

    /**
     * @param {import('../types.js').Main} main
     * @param {string[]} args
     */
    tabCompletion(main, args) {
        if (args.length > 1) return [];

        const arg = args[0].toLowerCase();
        return ["on", "off", "restart"].filter(completion => completion.startsWith(arg));
    }
}