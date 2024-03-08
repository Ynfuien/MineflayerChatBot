const { writeFileSync } = require('fs');

const { logBot } = require("../utils/logger.js");
const { loadConfig, checkConfig, getConfigPath } = require('../utils/configManager.js');
const ObjectUtils = require('../utils/objectUtils.js');

module.exports = {
    name: "config",
    enable: true,
    aliases: ["cfg"],
    usage: "<set | get | show | reload> [setting] [new value]",
    description: "Manage config settings.",

    /**
     * @param {import("..").Main} main
     * @param {string[]} args
     */
    run (main, args) {
        if (args.length === 0) return false;

        const arg1 = args[0].toLowerCase();

        // Get
        if (arg1 === "get") {
            const { values } = main.config;

            const arg2 = args[1];

            if (!arg2) {
                logBot(`&cYou must provide setting you want to get! E.g. ${values['bot-commands'].prefix}${this.name} get login.username`);
                return;
            }

            const setting = ObjectUtils.getValueByKeyPath(values, arg2);

            if (!setting.exists) {
                logBot(`&cSetting '${arg2}' doesn't exist.`);
                return;
            }

            const settingString = ObjectUtils.convertObjectToString(setting.value);
            logBot(`&bSetting '${arg2}' value:`);
            logObjectString(settingString);
            return;
        }

        // Set
        if (arg1 === "set") {
            const { config } = main;
            const { values, yawn } = config;

            const arg2 = args[1];
            if (!arg2) {
                logBot(`&cYou must provide setting you want to set! E.g. ${values['bot-commands'].prefix}${this.name} set login.username <new value>`);
                return;
            }

            const arg3 = args[2];
            if (!arg3) {
                logBot(`&cYou must provide value you want to set! E.g. ${values['bot-commands'].prefix}${this.name} set ${arg2} new value`);
                return;
            }

            const newValue = args.slice(2).join(' ');
            const newConfig = ObjectUtils.setValueByKeyPath(structuredClone(values), arg2, newValue);

            
            if (newConfig === false) {
                logBot(`&cParent of the setting '${arg2}' doesn't exist.`);
                return;
            }

            config.values = newConfig;
            if (checkConfig(main) === false) {
                config.values = values;
                logBot(`&cSetting &e'${arg2}' &ccan't be set to &e'${newValue}'&c!`);
                return;
            }

            yawn.json = newConfig;
            config.values = yawn.json;

            try {
                writeFileSync(getConfigPath(main), yawn.yaml, "utf8");
            } catch (e) {
                logBot(`&cAn error occured while saving new setting to config file. Error: ${e}`);
                return;
            }

            logBot(`&bSetting &3'${arg2}' &asuccessfully &bhas been set to &3'${newValue}'&b. &7If you changed e.g. bot username, you must restart bot.`);
            return;
        }

        // Show
        if (arg1 === "show") {
            const { config } = main;

            const configString = ObjectUtils.convertObjectToString(config.values);

            logBot("&bBot config:");
            logObjectString(configString);
            return;
        }

        // Reload
        if (arg1 === "reload") {
            const { config } = main;
            
            logBot("&bReloading config...");

            const result = loadConfig(main);
            if (!result.success) {
                logBot(`&cAn error occured while reloading config. Fix it and reload config again. Error message: ${result.error}`);
                return;
            }

            const oldConfig = config.values;
            config.values = result.config.values;

            const checkResult = checkConfig(main);
            if (checkResult === false) {
                logBot("There is an error in config. Fix it and reload config again. At this time will be used old config");
                config.values = oldConfig;
                return;
            }


            logBot("&bConfig has been reloaded! &7Keep in mind that some settings require entire script restart and it is recommended to do so.");
            return;
        }

        return false;
    },

    /**
     * @param {import("..").Main} main
     * @param {string[]} args
     */
    tabCompletion(main, args) {
        if (args.length > 2) return [];

        // First arg
        const arg1 = args[0].toLowerCase();
        if (args.length === 1) {
            return ["get", "set", "show", "reload"].filter(element => element.startsWith(arg1));
        }
        
        // Second arg
        if (!["get", "set"].includes(arg1)) return [];
        
        const { config } = main;

        const fullPath = args[1];

        const splitPath = fullPath.split('.');
        if (splitPath.length < 2) return Object.keys(config.values).filter(element => element.startsWith(fullPath));
        
        const path = splitPath.slice(0, -1).join(".");
        const setting = ObjectUtils.getValueByKeyPath(config.values, path);


        if (!setting.exists) return [];
        if (typeof setting.value !== "object") return [];

        const completions = [];

        const keys = Object.keys(setting.value);
        for (const key of keys) {
            const subsetting = `${path}.${key}`;
            if (subsetting.startsWith(fullPath)) completions.push(subsetting);
        }
        return completions;
    }
}

/**
 * @param {string} objectString
 */
function logObjectString(objectString) {
    const lines = objectString.split('\n');
    for (const line of lines) {
        logBot(line, '§');
    }
}