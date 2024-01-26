const {logChatMessage} = require('../utils/logger.js');

module.exports = {
    name: "message",
    enable: true,

    /**
     * @param {import("..").Main} main
     * @param {import("prismarine-chat").ChatMessage} message
     * @param {string} chatPosition
     */
    run (main, message, chatPosition) {
        const {chat} = main.config.values;
        
        
        if (message.unsigned) message = message.unsigned;
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

            logChatMessage(message, "§#12ff98[ActionBar] §f");
            return;
        }

        logChatMessage(message);
    }
}