const { startBot } = require('../utils/botManager.js');
const {logBot} = require('../utils/logger.js');

module.exports = {
    name: "end",
    enable: false,

    run (main) {
        logBot("&cBot has been turned off.");
        main.bot = null;

        delete main.temp.bot.joined;
        delete main.temp.bot.onServer;

        // If restart command used
        if (main.temp.bot.restart === true) {
            delete main.temp.bot.restart;
            logBot("&bTurning bot &aon&f..")
            startBot(main);
            return;
        }

        
        // If stop command used
        if (main.temp.bot.stop === true) {
            delete main.temp.bot.stop;
            return;
        }

        // If auto rejoin is set
        const {autoRejoin} =  main.temp.config;
        if (!autoRejoin) return;
        if (autoRejoin.enabled !== true) return;

        const {timeout} = autoRejoin;

        if (timeout > 0) {
            logBot(`&bBot will rejoin server after &3${timeout} &bsecond(s)!`);
        }

        setTimeout(() => {
            if (!main.bot) {
                logBot("Rejoining to server..")
                startBot(main); 
            }
        }, timeout * 1000);
    }
}