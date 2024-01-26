const mineflayer = require('mineflayer');
const prismarineChat = require('prismarine-chat');

const eventHandler = require('../handlers/event.handler.js');

module.exports = {
    /**
     * @param {import('../index.js').Main} main
     */
    startBot(main) {
        const botOptions = {...main.config.values.server, ...main.config.values.login};

        main.bot = mineflayer.createBot(botOptions);
        main.prismarine.ChatMessage = prismarineChat(main.bot.registry);

        eventHandler(main);
    }
}