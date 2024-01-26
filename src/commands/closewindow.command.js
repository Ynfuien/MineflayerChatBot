const {logBot} = require('../utils/logger.js');

module.exports = {
    name: "closewindow",
    enable: true,
    aliases: ["close"],
    description: "Closes currently opened window.",

    /**
     * @param {import("..").Main} main
     * @param {string[]} args
     */
    async run (main, args) {
        const {bot} = main;

        const window = bot.currentWindow;
        if (!window) {
            logBot("&cBot doesn't have any windows opened!")
            return;
        }

        bot.closeWindow(window);
        logBot(`&aClosed a window!`);
        return;
    },
    
    /**
     * @param {import("..").Main} main
     * @param {string[]} args
     */
    tabCompletion(main, args) {
        return [];
    }
}