const chalk = require('chalk');

// Legacy codes mapped to hex colors and chalk formats
const CHALK_COLORS = {
    colors: {
        '0': "000000",
        '1': "0000AA",
        '2': "00AA00",
        '3': "00AAAA",
        '4': "AA0000",
        '5': "AA00AA",
        '6': "FFAA00",
        '7': "AAAAAA",
        '8': "555555",
        '9': "5555FF",
        'a': "55FF55",
        'b': "55FFFF",
        'c': "FF5555",
        'd': "FF55FF",
        'e': "FFFF55",
        'f': "FFFFFF"
    },
    formats: {
        'l': chalk.bold,
        'n': chalk.underline,
        'm': chalk.strikethrough,
        'o': chalk.italic
    }
};



let savedMessagesCount = 0;
let lastMessageTimestamp = Date.now();

/** @type {import('..').Main} */
let main;


const self = module.exports = {
    log(message, codeChar = '&') {
        const time = new Date();

        logToConsole(message, time, codeChar);
        logToOnlinePanel(message, time, codeChar);
        logToDatabase(message, time, codeChar);
    },

    logBot(message, codeChar = '&') {
        self.log(`${codeChar}f${codeChar}l[BOT] ${codeChar}f${message}`, codeChar);
    },

    logChatMessage(message, prefix = '') {
        self.log(prefix + message.toMotd(), '§');
    },


    setup(_main) {
        main = _main;

        const {database} = main;
        if (!database) return;

        const messagesCount = database.prepare("SELECT COUNT(*) FROM messages").pluck().get();
        savedMessagesCount = messagesCount;
        if (messagesCount < 1) return;

        const timestamp = database.prepare("SELECT timestamp FROM messages ORDER BY timestamp DESC LIMIT 1").pluck().get();
        lastMessageTimestamp = timestamp;
    }
}

function logToOnlinePanel(message, date, codeChar = '&') {
    if (!main) return;
    if (!main.panel) return;
    if (!main.panel.io) return;

    main.panel.io.emit("chat-message", {
        type: "message",
        timestamp: date ? date.getTime() : Date.now(),
        message: codeChar != '§' ? message.replace(new RegExp(codeChar, 'g'), '§') : message
    });
}

function logToDatabase(message, date, codeChar = '§') {
    if (!main) return;
    const {database} = main;
    if (!database) return;

    const {chatLogs} = main.vars;
    if (!chatLogs.enabled) return;

    
    if (codeChar !== '§') message = message.replace(new RegExp(codeChar, 'g'), '§');
    database.prepare("INSERT INTO messages(message, timestamp) VALUES(?, ?)").run(message, date.getTime());
    savedMessagesCount++;

    
    const {limitType, limit} = chatLogs;

    // Limit by infinity
    if (limitType === "infinity") return;

    // Limit by count
    if (limitType === "count") {
        if (savedMessagesCount > limit) {
            const difference = savedMessagesCount - limit;

            database.prepare(`DELETE FROM messages ORDER BY timestamp LIMIT ${difference}`).run();
            savedMessagesCount -= difference;
        }

        return;
    }

    // Limit by time
    if (limitType === "time") {
        const limitTimestamp = date.getTime() - (limit * 60 * 1000);
        // if (lastMessageTimestamp < limitTimestamp) {

        const result = database.prepare("DELETE FROM messages WHERE timestamp<?").run(limitTimestamp);
        savedMessagesCount -= result.changes;

        const timestamp = database.prepare("SELECT timestamp FROM messages ORDER BY timestamp LIMIT 1").pluck().get();
        lastMessageTimestamp = timestamp;
        // }
        return;
    }
}


/**
 * @param {string} message 
 * @param {Date} time 
 * @param {string} codeChar 
 */
function logToConsole(message, time, codeChar = '§') {
    let chars = message.split('');

    let toLog = "";

    let currentColorHex = "#FFFFFF";
    let currentColor = chalk.hex(currentColorHex);

    // Im not gonna touch that
    for (let i = 0; i < chars.length; i++) {
        let char = chars[i];

        if (char != codeChar) {
            toLog += currentColor(char);
            continue;
        }

        let nextChar = chars[i + 1];

        if (!nextChar) {
            toLog += currentColor(char);
            continue;
        }

        nextChar = nextChar.toLowerCase();

        let color = CHALK_COLORS.colors[nextChar];
        if (color) {
            currentColorHex = `#${color}`;
            currentColor = chalk.hex(currentColorHex);
            i++;
            continue;
        }

        if (nextChar === '#') {
            let isHex = true;
            for (let j = 1; j < 6; j++) {
                let loopChar = chars[i + 1 + j];
                if (!loopChar) {
                    isHex = false;
                    break;
                }

                if (!loopChar.match(/[a-f0-9]/i)) {
                    isHex = false;
                    break;
                }
            }

            if (isHex) {
                let hexChars = chars.slice(i, i + 1 + 1 + 6);
                currentColorHex = `#${hexChars.join('')}`;
                currentColor = chalk.hex(currentColorHex);

                i += 7;
                continue;
            }
        }

        let format = CHALK_COLORS.formats[nextChar];
        if (format) {
            if (format == chalk.bold) {
                currentColor = currentColor.bold;
            } else if (format == chalk.underline) {
                currentColor = currentColor.underline;
            } else if (format == chalk.strikethrough) {
                currentColor = currentColor.strikethrough;
            } else if (format == chalk.italic) {
                currentColor = currentColor.italic;
            }

            i++;
            continue;
        }

        if (nextChar === 'r') {
            currentColorHex = "#FFFFFF";
            currentColor = chalk.hex(currentColorHex);

            i++;
            continue;
        }

        if (nextChar === 'k') {
            i++;
            continue;
        }
    }


    const dateTime = `[${time.toLocaleDateString("pl-PL", {month: "2-digit", day: "2-digit"})} ${time.toLocaleTimeString("pl-pl")}]`;
    console.log(chalk.hex("#969696")(`${dateTime} `) + toLog);
}
