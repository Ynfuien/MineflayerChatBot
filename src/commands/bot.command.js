const { startBot } = require("../utils/botManager.js");
const { logBot } = require("../utils/logger.js");

module.exports = {
    name: "bot",
    enable: false,
    usage: "<start | stop | restart>",
    description: "Starts, stops or restarts bot.",

    /**
     * @param {import("..").Main} main
     * @param {string[]} args
     */
    run (main, args) {
        const {bot} = main;

        let arg1 = args[0];

        if (arg1 === "stop") {
            if (!bot) return logBot("&cBot is already off!");

            logBot("&bTurning bot &coff&b..");
            bot.end();
            main.temp.bot.stop = true;
            return;
        }

        if (arg1 === "start") {
            if (bot) return logBot("&cBot is already on!");

            logBot("&bTurning bot &aon&b..");
            startBot(main);
            return;
        }

        if (arg1 === "restart") {
            if (!bot) {
                logBot("&bTurning bot &aon&b..");
                startBot(main);
                return;
            }

            logBot("&bTurning bot &coff&b..");
            bot.end();
            main.temp.bot.restart = true;
            return;
        }

        return false;
    },

    /**
     * @param {import("..").Main} main
     * @param {string[]} args
     */
    tabCompletion(main, args) {
        if (!args) return [];
        if (args.length !== 1) return [];

        const arg1 = args[0].toLowerCase();

        return ["start", "stop", "restart"].filter(completion => completion.startsWith(arg1));
    }
}