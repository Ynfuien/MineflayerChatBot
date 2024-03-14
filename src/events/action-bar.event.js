const { packetToChatMessage } = require('../utils/message-utils.js');
const { sendActionBar } = require('../web-panel/web-panel.js');

module.exports = {
    name: "action_bar",
    lowLevelApi: true,
    enable: true,

    /**
     * @param {import('../types.js').Main} main
     * @param {{text: string | object}} packet
     */
    run(main, packet) {
        if (main.vars.bot.ignoreActionBar === true) return;

        const message = packetToChatMessage(main.bot, packet.text);
        sendActionBar(message);
    }
}