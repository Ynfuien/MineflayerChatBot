const mineflayer = require('mineflayer');

const eventHandler = require('../handlers/event.handler.js');

const { load: loadScoreboardTape } = require('../duck-tapes/scoreboard.tape.js');
const { load: loadMapTape } = require('../duck-tapes/map.tape.js');
const { load: loadChatSuggestionsTape } = require('../duck-tapes/chat-suggestions.tape.js');

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

        loadScoreboardTape(main.bot);
        loadMapTape(main.bot);
        loadChatSuggestionsTape(main.bot);
    }
}