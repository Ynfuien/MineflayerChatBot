const mineflayer = require('mineflayer');
const prismarineChat = require('prismarine-chat');

const eventHandler = require('../handlers/event.handler.js');

module.exports = {
    /**
     * @param {import('../index.js').Main} main
     */
    startBot(main) {
        main.bot = mineflayer.createBot(main.config.values['bot-options']);
        main.prismarine.ChatMessage = prismarineChat(main.bot.registry);

        eventHandler(main);
    }
}