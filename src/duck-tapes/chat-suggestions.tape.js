/** @type {import('../types.js').TapedBot} */
let bot;

module.exports = {
    /**
     * @param {import('../types.js').TapedBot} _bot
     */
    load(_bot) {
        bot = _bot;

        const suggestions = [];
        if (!bot.duckTape) bot.duckTape = {};
        bot.duckTape.chatSuggestions = suggestions;


        bot._client.on("chat_suggestions", /** @param {import('../types.js').ChatSuggestionsPacket} packet */(packet) => {
            const { action, entries } = packet;

            // Add
            if (action === 0) {
                if (!Array.isArray(entries)) return;

                suggestions.push(...entries);
                return;
            }

            // Remove
            if (action === 1) {
                if (!Array.isArray(entries)) return;
                
                for (const entry of entries) {
                    const index = suggestions.indexOf(entry);
                    if (index === -1) continue;

                    suggestions.splice(index, 1);
                }
                return;
            }

            // Set
            if (action === 2) {
                if (!Array.isArray(entries)) return;
                
                suggestions.splice(0, suggestions.length);
                suggestions.push(...entries);
                return;
            }
        });
    }
};