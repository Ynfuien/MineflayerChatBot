module.exports = {
    isKeyExist(object, keyPath) {
        let keys = keyPath.split('.');

        let currentSetting = object;
        for (const key of keys) {
            currentSetting = currentSetting[key];
            if (currentSetting === undefined) return undefined;
        }

        return currentSetting;
    },

    setValueByKeyPath(object, keyPath, value) {
        let keys = keyPath.split('.');

        let previous = [];
        {
            let currentSetting = object;
            for (const key of keys) {
                previous.push(currentSetting);
                currentSetting = currentSetting[key];
                if (currentSetting === undefined) return false;
            }
        }
        

        let returnObject = value;
        for (let i = previous.length - 1; i >= 0; i--) {
            let pre = previous[i];
            pre[keys[i]] = returnObject;
            returnObject = pre;
        }

        return returnObject;
    },

    convertObjectToString(object) {
        return objectToString(object);
    },

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
        // if (Array.isArray(object)) {
        //     console.log("array");
        //     return "array";
        // }

        let type = typeof object;
        if (type === "string") {
            return `§#CE9178"${object}"`;
        }

        if (type === "bigint" || type === "number") {
            // console.log({isNan: isNaN(object), object: object});
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