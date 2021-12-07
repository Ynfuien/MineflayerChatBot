const {logMessage} = require('../utils/logger.js');

module.exports = {
    name: "message",
    enable: true,

    run (main, message, chatPosition) {
        const {chat} = main.config;

        if (chat && chat["ignored-messages"]) {
            const ignoredMessages = chat["ignored-messages"];
            
            if (ignoredMessages.length > 0) {
                const text = message.toString();
                for (const pattern of ignoredMessages) {
                    if (text.match(new RegExp(pattern, 'g'))) return;
                }
            }
        }

        if (chatPosition === "action_bar") {
            logMessage(message, "§#12ff98[ActionBar] §f");
            return;
        }

        logMessage(message);
    }
}