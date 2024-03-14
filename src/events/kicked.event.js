const { logBot } = require('../utils/logger.js');
const { packetToChatMessage } = require('../utils/message-utils.js');

module.exports = {
    name: "kicked",
    enable: true,

    /**
     * @param {import('../types.js').Main} main
     * @param {string} reason
     */
    run(main, reason) {
        const message = packetToChatMessage(main.bot, reason);
        logBot(`§c§lBot has been kicked from the server, reason:\n§f${message.toMotd()}`, '§');

        if (!main.vars.autoRejoin.enabled) {
            const { enabled, prefix } = main.vars.botCommands;
            if (!enabled) return;

            logBot(`&bIf you want to rejoin type &3${prefix}bot start`);
        }
    }
}