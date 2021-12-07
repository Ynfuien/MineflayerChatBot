const mineflayer = require('mineflayer');

const eventHandler = require('../handlers/event.handler.js');

module.exports = {
    startBot(main) {
        main.bot = mineflayer.createBot(main.botOptions);
        
        eventHandler(main);
    }
}