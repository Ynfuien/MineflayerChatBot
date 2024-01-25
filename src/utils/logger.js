const chalk = require('chalk');


let logsMessagesCount = 0;
let logsLastMessageTimestamp = Date.now();

let main = null;

let chalkColors = {
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
}

let self = module.exports = {
    log(message) {
        logColor(message, '&');
    },

    logMotd(message) {
        logColor(message);
    },

    logMessage(message, prefix = '') {
        logColor(prefix + message.toMotd());
    },

    logWithCustomChar(message, codesChar = '§') {
        logColor(message, codesChar);
    },

    logBot(message, codesChar = '&') {
        let ch = codesChar;

        message = `${ch}f${ch}l[BOT] ${ch}f${message}`;
        logColor(message, ch);
    },

    setMain(providedMain) {
        main = providedMain;
    },

    onStartup() {
        if (!main) return null;
        if (!main.db) return null;
        const {db} = main;

        let messagesCount = db.prepare("SELECT COUNT(*) FROM messages").pluck().get();

        logsMessagesCount = messagesCount;

        if (messagesCount < 1) return;

        let timestamp = db.prepare("SELECT timestamp FROM messages ORDER BY timestamp LIMIT 1").pluck().get();
        logsLastMessageTimestamp = timestamp;
    },

    sendToOnlinePanel(message, codesChar = '&', date) {
        if (!main) return;
        if (!main.panel) return;
        if (!main.panel.io) return;
    
        main.panel.io.emit("chat-message", {
            type: "message",
            timestamp: date ? date.getTime() : Date.now(),
            message: codesChar != '§' ? message.replace(new RegExp(`${codesChar}`, 'g'), '§') : message
        });
    }
}

function logToFile(message, codesChar = '§', date) {
    if (!main) return;
    if (!main.db) return;
    const {db} = main;

    const {logs}  = main.temp.config;
    if (!logs.enabled) return;

    
    const {type, limit} = logs;

    if (codesChar !== '§') {
        message = message.replace(new RegExp(codesChar, 'g'), '§');
    }

    db.prepare("INSERT INTO messages(message, timestamp) VALUES(?, ?)").run(message, date.getTime());
    logsMessagesCount++;


    // Limit by infinity
    if (type === "infinity") return;

    // Limit by count
    if (type === "count") {
        if (logsMessagesCount > limit) {
            let difference = logsMessagesCount - limit;

            db.prepare(`DELETE FROM messages ORDER BY timestamp LIMIT ${difference}`).run();
            
            logsMessagesCount -= difference;
        }

        return;
    }

    // Limit by time
    if (type === "time") {
        const maxLastMessageTimestamp = date.getTime() - (limit * 60 * 1000);
        if (logsLastMessageTimestamp < maxLastMessageTimestamp) {

            let res = db.prepare("DELETE FROM messages WHERE timestamp<?").run(maxLastMessageTimestamp);
            logsMessagesCount -= res.changes;

            let timestamp = db.prepare("SELECT timestamp FROM messages ORDER BY timestamp LIMIT 1").pluck().get();
            logsLastMessageTimestamp = timestamp;
        }
        return;
    }
}


function logColor(message, codesChar = '§', timestamp) {
    let d = new Date();
    if (timestamp) d = new Date(timestamp);

    self.sendToOnlinePanel(message, codesChar, d);
    logToFile(message, codesChar, d);

    let chars = message.split('');

    let toLog = "";

    let actualColorHex = "#FFFFFF";
    let actualColor = chalk.hex(actualColorHex);

    for (let i = 0; i < chars.length; i++) {
        let char = chars[i];

        if (char != codesChar) {
            toLog += actualColor(char);
            continue;
        }

        let nextChar = chars[i + 1];

        if (!nextChar) {
            toLog += actualColor(char);
            continue;
        }

        nextChar = nextChar.toLowerCase();

        let color = chalkColors.colors[nextChar];
        if (color) {
            actualColorHex = `#${color}`;
            actualColor = chalk.hex(actualColorHex);
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
                actualColorHex = `#${hexChars.join('')}`;
                actualColor = chalk.hex(actualColorHex);

                i += 7;
                continue;
            }
        }

        let format = chalkColors.formats[nextChar];
        if (format) {
            if (format == chalk.bold) {
                actualColor = actualColor.bold;
            } else if (format == chalk.underline) {
                actualColor = actualColor.underline;
            } else if (format == chalk.strikethrough) {
                actualColor = actualColor.strikethrough;
            } else if (format == chalk.italic) {
                actualColor = actualColor.italic;
            }

            i++;
            continue;
        }

        if (nextChar === 'r') {
            actualColorHex = "#FFFFFF";
            actualColor = chalk.hex(actualColorHex);

            i++;
            continue;
        }

        if (nextChar === 'k') {
            i++;
            continue;
        }
    }

    let date = `${addLeadingZero(d.getMonth() + 1)}.${addLeadingZero(d.getDate())}`;
    let time = `${addLeadingZero(d.getHours())}:${addLeadingZero(d.getMinutes())}:${addLeadingZero(d.getSeconds())}`;

    let dateTime = `[${date} ${time}]`;


    console.log(chalk.hex("#969696")(`${dateTime} `) + toLog);
}

function addLeadingZero(number) {
    if (number < 10) return `0${number}`;

    return number;
}
