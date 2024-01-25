const {logMessage, logMotd} = require('../utils/logger.js');
const {parseToMotd} = require("../utils//messageParser.js");


module.exports = {
    name: "message",
    enable: true,

    run (main, message, chatPosition) {
        const {chat} = main.config;

        // console.log(message.toMotd());
        if (message.unsigned) message = message.unsigned;
        // console.dir(message, {depth: 3});
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
            if (main.temp.bot.actionbar === false) return;
            logMessage(message, "§#12ff98[ActionBar] §f");
            return;
        }

        logMessage(message);
    }
}