const mineflayer = require('mineflayer');

const eventHandler = require('../handlers/event.handler.js');
const duckTapeHandler = require('../handlers/duck-tape.handler.js');

const { setLanguage } = require('./chat-message.js');
const { updateLanguage, updateItemsData: updateItemData, sendBotStartEvent } = require('../web-panel/web-panel.js');

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
        sendBotStartEvent();
        updateLanguage();
        updateItemData();

        eventHandler(main);
        duckTapeHandler(main);
    }
}