const { logBot } = require("../utils/logger.js");

module.exports = {
    name: "actionbar",
    enable: true,
    aliases: ["ab"],
    usage: "<on | off>",
    description: "Enables or disables action bar messages.",

    /**
     * @param {import('../types.js').Main} main
     * @param {string[]} args
     */
    run(main, args) {
        const { bot } = main.vars;

        const arg1 = args[0]?.toLowerCase();

        if (arg1 === "on" || arg1 === "enable") {
            if (bot.ignoreActionBar === false) return logBot("&cAction bar messages are already on!");

            bot.ignoreActionBar = false;
            logBot("&bAction bar messages turned &aon&b!");
            return;
        }

        if (arg1 === "off" || arg1 === "disable") {
            if (bot.ignoreActionBar === true) return logBot("&cAction bar messages are already off!");

            bot.ignoreActionBar = true;
            logBot("&bAction bar messages turned &coff&b!");
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

        const arg1 = args[0].toLowerCase();
        return ["on", "off"].filter(completion => completion.startsWith(arg1));
    }
}