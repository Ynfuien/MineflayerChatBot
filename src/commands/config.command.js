const { logBot } = require("../utils/logger.js");
const yt = require('../utils/YnfuTools.js');
const cm = require('../utils/configManager.js');
const {writeFileSync} = require('fs');

module.exports = {
    name: "config",
    enable: true,
    aliases: ["cfg"],
    usage: "<set | get | showall | reload> [setting] [new value]",
    description: "Manage config settings.",

    run (main, args) {

        let arg1 = args[0];

        if (arg1 === "get") {
            const {config} = main;
            
            let arg2 = args[1];

            if (!arg2) {
                logBot(`&cYou must provide setting you want to get! E.g. ${config.commands.prefix}${this.name} get login.username`);
                return;
            }

            const setting = yt.doesKeyExist(config, arg2);

            if (setting == undefined) {
                logBot(`&cSetting '${arg2}' doesn't exist.`);
                return;
            }

            if (typeof setting === "object") {
                logBot(`&cSetting '${arg2}' is object with more settings!`);
                return;
            }

            logBot(`&bValue of setting &3${arg2}&b: &9${setting}`);
            return;
        }

        if (arg1 === "set") {
            const {yawn, config} = main;

            let arg2 = args[1];
            if (!arg2) {
                logBot(`&cYou must provide setting you want to set! E.g. ${config.commands.prefix}${this.name} set login.username <new value>`);
                return;
            }

            let arg3 = args[2];
            if (!arg3) {
                logBot(`&cYou must provide value you want to set! E.g. ${config.commands.prefix}${this.name} set ${arg2} new value`);
                return;
            }

            let newValue = args.slice(2).join(' ');
            let newConfig = yt.setValueByKeyPath(config, arg2, newValue);

            if (newConfig === false) {
                logBot(`&cSetting '${arg2}' doesn't exist.`);
                return;
            }

            main.config = newConfig;
            if (cm.checkConfig(main) === false) {
                main.config = config;
                logBot(`&cSetting &e'${arg2}' &ccan't be set to &e'${newValue}'&c!`);
                return;
            }

            yawn.json = newConfig;
            main.config = yawn.json;
            main.yawn = yawn;

            cm.loadBotOptions(main);

            try {
                writeFileSync(`${__dirname}/../../config.yml`, yawn.yaml, "utf8");
            } catch (e) {
                logBot(`&cAn error occured while saving new setting to config file. Error: ${e}`);
                return;
            }

            logBot(`&bSetting &3'${arg2}' &asuccessfully &bhas been set to &3'${newValue}'&b. &7If you changed e.g. bot username, you must restart bot.`);
            return;
        }

        if (arg1 === "showall") {
            const {config} = main;
            
            let string = yt.convertObjectToString(config);
            let lines = string.split('\n');

            logBot("&bBot config:");
            for (const line of lines) {
                logBot(line, '§');
            }
            return;
        }

        if (arg1 === "reload") {
            logBot("&bReloading config...");
            let oldYawn = main.yawn;
            let oldConfig = main.config;

            let configLoading = cm.loadConfig(main);
            if (!configLoading.success) {
                main.yawn = oldYawn;
                main.config = oldConfig;
                logBot(`&cAn error occured while reloading config. Fix it and reload config again. Error message: ${configLoading.error}`);
                return;
            }


            let config = main.config;
            const checkResult = cm.checkConfig(main);
            if (checkResult === false) {
                logBot("There is an error in config. Fix it and reload config again. At this time will be used old config");
                main.yawn = oldYawn;
                main.config = oldConfig;
                return;
            }

            cm.loadBotOptions(main);

            expressInfo(oldConfig, config);

            logBot("&bConfig has been reloaded! &7Keep in mind that some settings require entire script restart and it is recommended to do.");
            return;
        }

        return false;
    },

    tabCompletion(main, args) {
        const {config} = main;

        if (!args) return [];

        if (args.length > 2) return [];

        const arg1 = args[0].toLowerCase();

        if (args.length === 1) {
            return yt.filterElementsThatStartsWith(["get", "set", "showall", "reload"], arg1);
        }

        if (args.length === 2) {
            if (arg1 !== "get" && arg1 !== "set") {
                return [];
            }
            const arg2 = args[1];

            const split = arg2.split('.');
            if (!arg2 || split.length < 2) return yt.filterElementsThatStartsWith(Object.keys(config), arg2);

            
            let path = arg2.substr(0, arg2.length - 1);
            if (!arg2.endsWith('.')) {
                path = split.slice(0, -1).join('.');
            }

            const settings = yt.doesKeyExist(config, path);
            if (typeof settings === "object") {
                let completions = [];

                for (const key of Object.keys(settings)) {
                    const setting = split.slice(0, -1).join('.') + '.' + key;
                    if (setting.startsWith(arg2)) completions.push(setting);
                }
                return completions;
            }
            
            return [];
        }
    }
}

function expressInfo(oldConfig, newConfig) {
    let oldPanel = oldConfig["online-panel"];
    let newPanel = newConfig["online-panel"];

    if (oldPanel.enabled !== newPanel.enabled) {
        if (oldPanel.enabled) {
            logBot("&cFor online panel server to close you need restart script!");
            return;
        }

        logBot("&cFor online panel server to start you need restart script!");
        return;
    }

    if (oldPanel.port !== newPanel.port) {
        logBot("&fFor online panel server port change you need restart script!");
        return;
    }
}