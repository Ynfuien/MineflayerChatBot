const { processNbtMessage } = require('prismarine-chat');
const { ChatMessage } = require('./chat-message.js');

const self = module.exports = {
    /**
     * Converts message from the packet to a ChatMessage.
     * Before 1.20.3 it was a string with json, but now
     * it's a NBT component, so this function handles
     * both cases.
     * @param {import('../types.js').TapedBot} bot 
     * @param {string | {type: string, value: string | object}} message 
     * @returns {ChatMessage}
     */
    packetToChatMessage(bot, message) {
        let jsonString = message;
        if (bot.supportFeature("chatPacketsUseNbtComponents") && message.type) {
            if (message.type === "string") return ChatMessage.fromLegacy(message.value);

            jsonString = processNbtMessage(message);
        }

        try {
            const json = JSON.parse(jsonString);
            const chatMessage = new ChatMessage(self.tapeFixNbtMessage(json));
            return chatMessage;
        } catch (e) {
            console.log(e);
            return;
        }
    },

    /**
     * 'Fixes' messages on 1.20.3+, that often have values like:
     * {extra: [{'': 'some text'}]}
     * Where this '' is a problem, since there should be a 'text' property.
     * @param {object} json 
     * @returns {object | any}
     */
    tapeFixNbtMessage(json) {
        if (typeof json !== "object") return json;
    
        const keys = Object.keys(json);
        for (const key of keys) {
            const value = json[key];
    
            if (key === "") {
                json["text"] = self.tapeFixNbtMessage(value);
                delete json[key];
                continue;
            }
    
            json[key] = self.tapeFixNbtMessage(value);
        }
    
        return json;
    }
};