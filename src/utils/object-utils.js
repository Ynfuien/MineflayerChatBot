module.exports = {
    /**
     * @param {Object} object 
     * @param {string} keyPath 
     * @returns {boolean}
     */
    doesKeyExist(object, keyPath) {
        const keys = keyPath.split('.');

        let currentChild = object;
        for (const key of keys) {
            if (!(key in currentChild)) return false;
            currentChild = currentChild[key];
        }

        return true;
    },

    /**
    * @param {Object} object 
    * @param {string} keyPath 
    * @returns {{exists: boolean, value?: any}}
    */
    getValueByKeyPath(object, keyPath) {
        const keys = keyPath.split('.');

        let currentChild = object;
        for (const key of keys) {
            if (typeof currentChild !== "object" || !(key in currentChild)) return { exists: false };
            currentChild = currentChild[key];
        }

        return { exists: true, value: currentChild };
    },

    /**
     * @param {Object} object 
     * @param {string} keyPath 
     * @param {any} value 
     * @returns {boolean | Object}
     */
    setValueByKeyPath(object, keyPath, value) {
        const keys = keyPath.split('.');

        let currentChild = object;
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!(key in currentChild)) return false;

            currentChild = object[key];
        }

        currentChild[keys.pop()] = value;

        return object;
    },

    convertObjectToString(object) {
        return objectToString(object);
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