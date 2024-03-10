const mineflayer = require('mineflayer');
const prismarineChat = require('prismarine-chat');

const eventHandler = require('../handlers/event.handler.js');
const { load: loadScoreboardTape } = require('../duck-tapes/scoreboard.tape.js');

module.exports = {
    /**
     * @param {import('../types.js').Main} main
     */
    startBot(main) {
        const options = structuredClone(main.config.values['bot-options']);
        main.bot = mineflayer.createBot(options);
        main.prismarine.ChatMessage = prismarineChat(main.bot.registry);

        eventHandler(main);
        loadScoreboardTape(main.bot);
    }
}