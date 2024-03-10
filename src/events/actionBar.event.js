const { packetToChatMessage } = require('../utils/messageUtils.js');
const { sendActionBar } = require('../webpanel/webPanel.js');

module.exports = {
    name: "action_bar",
    lowLevelApi: true,
    enable: true,

    /**
     * @param {import('../types.js').Main} main
     * @param {{text: string | object}} packet
     */
    run (main, packet) {
        if (main.vars.bot.ignoreActionBar === true) return;
        
        const message = packetToChatMessage(main.bot, packet.text);
        sendActionBar(message);
    }
}