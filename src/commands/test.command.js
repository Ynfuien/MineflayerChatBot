const { tabComplete } = require("../handlers/tabcomplete.handler.js");
const { writeBotTabCompletionPacket } = require("../utils/YnfuTools.js");
const { logBot } = require("../utils/logger.js");

module.exports = {
    name: "test",
    enable: true,
    aliases: ["t"],

    /**
     * @param {import("..").Main} main
     * @param {string[]} args
     */
    async run (main, args) {
        const {bot} = main;
        
        // console.log(bot.tablist.header.toAnsi());
        // console.log(bot.tablist.footer.toAnsi());
        const cmd = args.join(" ");
        

        // const maches = await bot.tabComplete(cmd, false, true);
        // // const maches = await tabComplete(main, cmd);
        // console.log(maches);


        // const completionPromise = bot.tabComplete(cmd);
        // const timeoutPromise = new Promise(resolve => setTimeout(resolve, 50));

        // const resultPromise = await Promise.race([comple-tionPromise, timeoutPromise])
        
        // const maches = !resultPromise ? [] : resultPromise;
        // console.log(maches);

        // writeBotTabCompletionPacket(bot, cmd, getTrans());
        // console.log(new Date().getTime());
        return true;


        /// -t g123456789012345678901234567890123456789012345678901234567890123
    },

    /**
     * @param {import("..").Main} main
     * @param {string[]} args
     */
    tabCompletion(main, args) {
        return [];
    }
}