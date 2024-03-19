const { ChatMessage } = require('../utils/chat-message.js');
const { logBot, log } = require('../utils/logger.js');
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
        log(ChatMessage.fromLegacy(`§c§lBot has been kicked from the server, reason:\n§f${message.toLegacy()}`));

        if (!main.vars.autoRejoin.enabled) {
            const { enabled, prefix } = main.vars.botCommands;
            if (!enabled) return;

            logBot(`&bIf you want to rejoin type &3${prefix}bot start`);
        }
    }
}