const {logBot} = require('../utils/logger.js');

module.exports = {
    name: "closewindow",
    enable: true,
    aliases: ["close"],
    description: "Closes currently opened window.",

    /**
     * @param {import('../types.js').Main} main
     * @param {string[]} args
     */
    async run (main) {
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
     * @param {import('../types.js').Main} main
     * @param {string[]} args
     */
    tabCompletion() {
        return [];
    }
}