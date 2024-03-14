const { ChatMessage } = require('../utils/chat-message.js');
const { logChatMessage } = require('../utils/logger.js');
const { tapeFixNbtMessage } = require('../utils/messageUtils.js');
const { sendActionBar } = require('../webpanel/webPanel.js');

module.exports = {
    name: "message",
    enable: true,

    /**
     * @param {import('../types.js').Main} main
     * @param {import("prismarine-chat").ChatMessage} message
     * @param {string} chatPosition
     */
    run(main, message, chatPosition) {
        const { bot } = main;
        const { chat } = main.config.values;

        if (message.unsigned) message = message.unsigned;
        
        let json = message.json;
        if (bot.supportFeature("chatPacketsUseNbtComponents")) {
            json = tapeFixNbtMessage(message.json);
        }
        message = new ChatMessage(json);

        if (chat && chat["ignored-messages"]) {
            const ignoredMessages = chat["ignored-messages"];

            if (ignoredMessages.length > 0) {
                const text = message.toString();
                for (const pattern of ignoredMessages) {
                    if (text.match(new RegExp(pattern, 'g'))) return;
                }
            }
        }

        if (chatPosition === "game_info") {
            if (main.vars.bot.ignoreActionBar === true) return;

            sendActionBar(message);
            return;
        }

        logChatMessage(message);
    }
}