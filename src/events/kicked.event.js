const {logBot} = require('../utils/logger.js');

module.exports = {
    name: "kicked",
    enable: true,

    /**
     * @param {import('../types.js').Main} main
     * @param {string} reason
     */
    run (main, reason) {
        const {ChatMessage} = main.prismarine;
        const json = JSON.parse(reason);

        const message = new ChatMessage(json);
        logBot(`§c§lBot has been kicked from the server, reason: §f${message.toMotd()}`, '§');

        if (!main.vars.autoRejoin.enabled) {
            const {enabled, prefix} = main.vars.botCommands;
            if (!enabled) return;

            logBot(`&bIf you want to rejoin type &3${prefix}bot start`);
        }
    }
}