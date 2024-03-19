const { startBot } = require('../utils/bot-manager.js');
const { logBot } = require('../utils/logger.js');

module.exports = {
    name: "end",
    enable: true,

    /**
     * @param {import('../types.js').Main} main
     */
    run(main) {
        logBot("&cBot has been turned off.");
        // Timeout because 'kick' event happens after 'end' event,
        // and kick event needs the bot instance.
        setTimeout(() => {
            main.bot = null;
        }, 10);

        main.vars.bot.joined = false;
        main.vars.bot.logPlayers = false;

        // If restart command used
        if (main.vars.bot.restart === true) {
            setTimeout(() => {
                main.vars.bot.restart = false;
                logBot("&bTurning bot &aon&f..");
                startBot(main);
            }, 20);
            return;
        }


        // If stop command used
        if (main.vars.bot.stop === true) {
            main.vars.bot.stop = false;
            return;
        }

        // If auto rejoin is set
        const { enabled, timeout } = main.vars.autoRejoin;
        if (enabled !== true) return;

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