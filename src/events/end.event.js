const { startBot } = require('../utils/botManager.js');
const { logBot } = require('../utils/logger.js');

module.exports = {
    name: "end",
    enable: true,

    /**
     * @param {import('../types.js').Main} main
     */
    run(main) {
        logBot("&cBot has been turned off.");
        main.bot = null;

        main.vars.bot.joined = false;
        main.vars.bot.logPlayers = false;

        // If restart command used
        if (main.vars.bot.restart === true) {
            main.vars.bot.restart = false;
            logBot("&bTurning bot &aon&f..")
            startBot(main);
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