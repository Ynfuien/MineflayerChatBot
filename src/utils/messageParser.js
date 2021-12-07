const fs = require('fs');

const translate = JSON.parse(fs.readFileSync(`${__dirname}/lang/en_us.json`));

let codesLegend = {
    colors: {
        black: '0',
        dark_blue: '1',
        dark_green: '2',
        dark_aqua: '3',
        dark_red: '4',
        dark_purple: '5',
        gold: '6',
        gray: '7',
        dark_gray: '8',
        blue: '9',
        green: 'a',
        aqua: 'b',
        red: 'c',
        light_purple: 'd',
        yellow: 'e',
        white: 'f'
    },
    formats: {
        bold: 'l',
        underlined: 'n',
        strikethrough: 'm',
        italic: 'o',
        obfuscated: 'k'
    }
};

module.exports = {
    parseToMotd(message) {
        if (!message) return null;
        
        return parseJsonMessageToMotd(message);
    },

    parseToBukkit(message) {
        if (!message) return null;
        
        return parseJsonMessageToMotd(message, '&');
    },

    parseWithCustomChar(message, codesChar) {
        if (!message) return null;
        
        return parseJsonMessageToMotd(message, codesChar);
    }
    
}

function parseJsonMessageToMotd(json, codesChar = '§', wasColor = false) {
    if (!json) return null;

    let message = "";

    if (json.color) {
        if (json.color.startsWith('#')) {
            message += `${codesChar}${json.color}`;
        }
        else {
            message += `${codesChar}${codesLegend.colors[json.color]}`;
        }
        wasColor = true;
    }
    else if (wasColor) {
        message += `${codesChar}r`;
        wasColor = false;
    }

    for (let format in codesLegend.formats) {
        if (json[format]) {
            message += `${codesChar}${codesLegend.formats[format]}`;
            wasColor = true;
        }
    }
    
    if (json.text) {
        message += json.text;
    }

    if (json.extra) {
        wasColor = false;
        for (let extraJson of json.extra) {
            message += parseJsonMessageToMotd(extraJson, codesChar, wasColor);
            if (extraJson.color) wasColor = true;
            else wasColor = false;
        }
    }

    if (json.translate) {
        let translation = translate[json.translate];

        if (json.with) {
            for (let value of json.with) {
                let parsed = parseJsonMessageToMotd(value, codesChar);
                translation = translation.replace("%s", parsed);
                translation = translation.replace(/%\d\$s/, parsed);
            }
        }
        message += translation;
    }

    return message;
}