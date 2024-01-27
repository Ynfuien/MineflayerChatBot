const {log, logWithCustomChar} = require('../utils/logger');

const before = [];
let timeout = 0;
module.exports = {
    name: "playerlist_header",
    lowLevelApi: true,
    enable: false,

    /**
     * @param {import("..").Main} main
     */
    run(main, packet) {
        const now = new Date().getTime();
        if (now - timeout < 10000) return;
        timeout = now;

        console.log(packet);
        // const ChatMessage = require('prismarine-chat')(main.bot.version);

        // if (!packet.header) {
        //     return;
        // }

        
        // const header = escapeValueNewlines(packet.header);
        // const chatMessage = new ChatMessage(JSON.parse(header));

        // const formatted = parseToBukkit(chatMessage);
        // const line = formatted.split('\n').shift();

        // if (before.includes(line)) return;
        // before.push(line);
        // console.log(`- '${line}'`);
    }
}

// const escapeValueNewlines = str => {
//     return str.replace(/(": *"(?:\\"|[^"])+")/g, (_, match) => match.replace(/\n/g, '\\n'));
// }