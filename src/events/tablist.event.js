const { tabListUpdate } = require('../webpanel/webPanel');

module.exports = {
    name: "playerlist_header",
    lowLevelApi: true,
    enable: true,

    /**
     * @param {import("..").Main} main
     * @param {{header?: string, footer?: string}} packet
     */
    run(main, packet) {
        const {ChatMessage} = main.prismarine;


        const {header, footer} = packet;
        
        const result = {};
        if (header) {
            try {
                const json = JSON.parse(header);
                const chatMessage = new ChatMessage(json);
                result.header = chatMessage;
            } catch (e) {
                console.log(e);
                return;
            }
        }

        if (footer) {
            try {
                const json = JSON.parse(footer);
                const chatMessage = new ChatMessage(json);
                result.footer = chatMessage;
            } catch (e) {
                console.log(e);
                return;
            }
        }

        tabListUpdate(result.header, result.footer);
    }
}