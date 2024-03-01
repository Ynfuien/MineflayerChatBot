const { sendActionBar } = require('../webpanel/webPanel.js');

module.exports = {
    name: "action_bar",
    lowLevelApi: true,
    enable: true,

    /**
     * @param {import("..").Main} main
     * @param {{text: string}} packet
     */
    run (main, packet) {
        if (main.vars.bot.ignoreActionBar === true) return;

        const { ChatMessage } = main.prismarine;

        const json = JSON.parse(packet.text);
        const message = new ChatMessage(json);

        sendActionBar(message);
    }
}