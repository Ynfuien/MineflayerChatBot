const { startBot } = require("../utils/botManager.js");
const { logBot } = require("../utils/logger.js");

module.exports = {
    name: "actionbar",
    aliases: ["ab"],
    enable: true,
    usage: "<on | off>",
    description: "Enables or disables action bar messages.",

    run (main, args) {
        const {bot} = main.temp;

        let arg1 = args[0];

        if (arg1 === "on" || arg1 === "enable") {
            if (bot.actionbar !== false) return logBot("&cAction bar messages are already on!");
            
            main.temp.bot.actionbar = true;
            logBot("&bAction bar messages turned &aon&b!");
            return;
        }

        if (arg1 === "off" || arg1 === "disable") {
            if (bot.actionbar === false) return logBot("&cAction bar messages are already off!");

            main.temp.bot.actionbar = false;
            logBot("&bAction bar messages turned &coff&b!");
            return;
        }

        return false;
    },

    tabCompletion(main, args) {
        if (!args) return [];
        if (args.length !== 1) return [];

        const arg1 = args[0].toLowerCase();

        return ["on", "off"].filter(completion => completion.startsWith(arg1));
    }
}