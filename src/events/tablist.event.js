const { packetToChatMessage } = require('../utils/messageUtils');
const { tabListUpdate } = require('../webpanel/webPanel');

module.exports = {
    name: "playerlist_header",
    lowLevelApi: true,
    enable: true,

    /**
     * @param {import('../types.js').Main} main
     * @param {{header?: string, footer?: string}} packet
     */
    run(main, packet) {
        const { header, footer } = packet;

        const result = {};
        if (header) result.header = packetToChatMessage(main.bot, header);
        if (footer) result.footer = packetToChatMessage(main.bot, footer);

        tabListUpdate(result.header, result.footer);
    }
}