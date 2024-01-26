module.exports = {
    writeBotTabCompletionPacket(bot, text, transactionId) {
        if (typeof transactionId !== "bigint" && typeof transactionId !== "number") {
            return false;
        }

        bot._client.write('tab_complete', {
            text,
            assumeCommand: false,
            lookedAtBlock: undefined,
            transactionId
        });
        
        return true;
    },

    filterElementsThatStartsWith(array, startsString) {
        return array.filter(element => element.startsWith(startsString));
    }
}

function objectToString(object, deep = 0) {
    if (object == null || object == undefined) {
        return "§#FFFFFFnull";
    }

    if (typeof object !== "object") {

        let type = typeof object;
        if (type === "string") {
            return `§#CE9178"${object}"`;
        }

        if (type === "bigint" || type === "number") {
            return "§#B5CEA8" + object;
        }

        if (type === "boolean") {
            return "§#569CD6" + object;
        }

        return "§#FFFFFF" + object;
    }

    
    let string = deep == 0 ? '' : `\n${"  ".repeat(deep)}`;

    if (Array.isArray(object)) {
        if (object.length < 1) {
            return "§#FFFFFF[]"; 
        }

        for (const element of object) {
            string += `§#D4D4D4- ${objectToString(element, deep + 1)}`;
            if (object.indexOf(element) < object.length - 1) string += `\n${"  ".repeat(deep)}`;
        }
        return string;
    }

    let i = 0;
    let size = Object.keys(object).length;
    for (let key in object) {
        i++;
        string += `§#569CD6${key}§#D4D4D4: ${objectToString(object[key], deep + 1)}`;
        if (i < size) string += `\n${"  ".repeat(deep)}`;
    }

    return string;
}