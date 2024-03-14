const mineflayer = require('mineflayer');

const eventHandler = require('../handlers/event.handler.js');
const { load: loadScoreboardTape } = require('../duck-tapes/scoreboard.tape.js');
const { setLanguage } = require('./chat-message.js');
const { updateLanguage } = require('../webpanel/webPanel.js');

module.exports = {
    /**
     * @param {import('../types.js').Main} main
     */
    startBot(main) {
        const options = structuredClone(main.config.values['bot-options']);
        main.bot = mineflayer.createBot(options);

        // Nodejs
        setLanguage(main.bot.registry.language);
        // Online panel
        updateLanguage();

        eventHandler(main);
        loadScoreboardTape(main.bot);
    }
}