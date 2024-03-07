const YAWN = require('yawn-yaml/cjs');
const yaml = require('js-yaml');
const fs = require('fs');

const { logBot } = require('./logger.js');
const { doesKeyExist } = require('./objectUtils.js');

/**
 * @typedef {{
 *      server: {
 *          host: string,
 *          port?: number,
 *          version?: string
 *      },
 *      login: {
 *          username: string,
 *          password?: string,
 *          auth?: string
 *      },
 *      'bot-commands': {
 *          enabled: boolean,
 *          prefix: string
 *      },
 *      chat: {
 *          'ignored-messages': string[] | undefined,
 *          prefix: string,
 *          logs: {
 *              enabled: true,
 *              'limit-type': string,
 *              limit: integer | string,
 *          }
 *      },
 *      'on-join': {
 *          commands: string[] | undefined
 *      },
 *      'auto-rejoin': {
 *          enabled: boolean,
 *          timeout: number
 *      },
 *      'online-panel': {
 *          enabled: boolean,
 *          port: number,
 *          'chat-patterns': {
 *              minecraft: string,
 *              bot: string
 *          },
 *          'last-messages': {
 *              type: string,
 *              limit: number | string
 *          },
 *          'tab-list': {
 *              enabled: boolean,
 *              interval: number,
 *              'players-interval': number
 *          }
 *      }
 * }} Config
 */


const self = module.exports = {
    /**
     * @param {import('../index.js').Main} main
     * @returns {string}
     */
    getConfigPath(main) {
        return `${__dirname}/../../config${main.dev ? ".dev" : ""}.yml`
    },

    /**
     * @param {import('../index.js').Main} main
     * @returns {{success: boolean, error: string | Error | undefined, config: {values: Config, yawn: YAWN.default}}}
     */
    loadConfig(main) {
        const filePath = self.getConfigPath(main);
        
        if (!fs.existsSync(filePath)) return { success: false, error: `Config file doesn't exist! (${filePath})` };

        let fileContent;
        try {
            fileContent = fs.readFileSync(filePath, 'utf-8')
        } catch (e) {
            return { success: false, error: e };
        }

        try {
            const values = yaml.load(fileContent);
            const yawn = new YAWN(fileContent);

            return { success: true, config: { values, yawn } };
        } catch (e) {
            return { success: false, error: e };
        }
    },

    /**
     * @param {import('../index.js').Main} main 
     * @param {boolean} logErrors
     * @returns {boolean | {softError: boolean}}
     */
    checkConfig(main, logErrors = true) {
        const config = main.config.values;
        let softError = false;

        if (!config) {
            logError("&3[Config] &cConfig data is incorrect!");
            return false;
        }

        // Check obligatory sections
        for (let sectionkey of ["server.host", "login.username"]) {
            if (doesKeyExist(config, sectionkey)) continue;
            
            logError(`Config field '${sectionkey}' isn't set! Bot can't work without it. Correct it and start the bot again.`);
            return false;
        }

        // Checks for each section
        let result;

        // Server
        result = (function (server) {
            const { host, port, version } = server;

            // Check host
            const ip = host.toLowerCase();
            const allowed = [
                // Localhost
                "^localhost$",
                // Domain
                "^(((?!-))(xn--|_{1,1})?[a-z0-9-]{0,61}[a-z0-9]{1,1}\\.)*(xn--)?([a-z0-9][a-z0-9\\-]{0,60}|[a-z0-9-]{1,30}\\.[a-z]{2,})$",
                // IPv4
                "^((25[0-5]|(2[0-4]|1\\d|[1-9]|)\\d)(\\.(?!$)|$)){4}$",
                // IPv6
                "^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$"
            ];

            let correctHost = false;
            for (const check of allowed) {
                if (ip.match(new RegExp(check, 'g'))) {
                    correctHost = true;
                    break;
                }
            }

            if (!correctHost) {
                logError("Provided server host is incorrect! Correct it and restart bot.");
                return false;
            }

            // Check for port
            if (port) {
                const checkResult = checkPort(port);
                if (!checkResult.correct) {
                    logError(`Server ${checkResult.message} Correct it and restart bot.`);
                    return false;
                }
            }

            // Check version
            if (version) {
                if (typeof version !== "string") {
                    logError("Minecraft version must be string! Correct it and restart bot.");
                    return false;
                }
            }

        })(config.server);
        if (result === false) return false;

        // Login
        result = (function (login) {
            const { username, password } = login;
            let { auth } = login;

            // Check username
            // I guess that's an email check
            if (!username.match(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/g)) {
                if (!username.match(/^[a-z0-9_]{3,16}$/gi)) {
                    logError("Provided username is incorrect! Correct it and restart bot");
                    return false;
                }

                // Username is used, so no password needed.
                return;
            }

            // Check password
            if (!password) {
                logError("You must provide password for account verification!");
                return false;
            }

            // Check auth
            if (auth) {
                if (typeof auth !== "string") {
                    logError("Authorization field must be string!");
                    return false;
                }

                auth = auth.toLowerCase();
                if (auth !== "microsoft" && auth !== "mojang") {
                    logError("Provided authorization is incorrect! Avaiable authorization options are: microsoft, mojang");
                    return false;
                }
            }

        })(config.login);
        if (result === false) return false;

        // Commands
        main.vars.botCommands.enabled = (function (botCommands) {
            if (!botCommands) return false;

            const { enabled, prefix } = botCommands;
            if (enabled !== true) return false;

            if (!prefix) {
                logError("Prefix for commands is incorrect! BOt commands won't work unless you correct it");
                return false;
            }

            main.vars.botCommands.prefix = prefix;
            return true;
        })(config["bot-commands"]);

        // Chat
        main.vars.chatLogs.enabled = (function (chat) {
            if (!chat) return false;

            const ignoredMessages = chat["ignored-messages"];
            if (ignoredMessages && !Array.isArray(ignoredMessages)) {
                logError("Ignored messages must be an array!");
            }

            // Logs
            const { logs } = chat;

            if (!logs) return false;
            if (logs.enabled !== true) return false;

            // Logs limit type
            const limitType = (function (type) {
                if (!type) {
                    logError("Chat logs limit type isn't set! Will be used type 'infinity'");
                    return "infinity";
                }

                if (typeof type !== "string") {
                    logError("Chat logs limit type must be a string! Will be used type 'infinity'");
                    return "infinity";
                }

                type = type.toLowerCase();
                if (!["count", "time", "infinity"].includes(type)) {
                    logError("Provided chat logs limit type is incorrect! Will be used type 'infinity'");
                    return "infinity";
                }

                return type;
            })(logs["limit-type"]);


            main.vars.chatLogs.limitType = limitType;
            if (limitType === "infinity") return true;

            // Logs limit
            return (function (limit) {
                if (limit === undefined) {
                    logError("Chat logs limit isn't set! Logs won't work.");
                    return false;
                }

                if (isNaN(limit)) {
                    logError("Chat logs limit must be a number! Logs won't work");
                    return false;
                }

                if (limit < 5) {
                    logError("Chat logs limit must be at least 5! Logs will use that limit unless you change yours");
                    limit = 5;
                }

                main.vars.chatLogs.limit = limit;
                return true;
            })(logs.limit);
        })(config.chat);

        // On join
        main.vars.onJoin.commands = (function (onJoin) {
            if (!onJoin) return [];
            if (!onJoin.commands) return [];

            const { commands } = onJoin;
            if (!Array.isArray(commands)) {
                logError("On join commands must be an array!");
                return [];
            }

            const correctCommands = [];

            const pattern = new RegExp("\\d+:.+", 'g');
            for (const command of commands) {
                if (!command.match(pattern)) {
                    logError(`Command '${command}' doesn't match pattern! Correct it to work`);
                    continue;
                }
                
                const split = command.split(':');
                const timeout = parseInt(split.shift());
                const message = split.join(':');

                correctCommands.push({timeout, message});
            }

            return correctCommands;
        })(config["on-join"]);

        // Auto rejoin
        main.vars.autoRejoin.enabled = (function (autoRejoin) {
            if (!autoRejoin) return false;

            const { enabled, timeout } = autoRejoin;
            if (enabled !== true) return false;

            const isCorrect = (function (timeout) {
                if (timeout === undefined) {
                    logError("Auto rejoin timeout isn't set! Will be used timeout '10'");
                    return;
                }

                if (isNaN(timeout)) {
                    logError("Auto rejoin timeout must be number! Will be used timeout '10'");
                    return;
                }

                if (timeout < 0) {
                    logError("Auto rejoin timeout can't be lower than 0! Will be used timeout '10'");
                    return;
                }

                return true;
            })(timeout);

            if (isCorrect === true) main.vars.autoRejoin.timeout = timeout;
            return true;
        })(config["auto-rejoin"]);

        // Online panel
        main.vars.onlinePanel.enabled = (function (onlinePanel) {
            if (!onlinePanel) return false;

            const { enabled, port } = onlinePanel;
            if (enabled !== true) return false;

            const checkResult = checkPort(port);
            if (!checkResult.correct) {
                logError(`Online panel ${checkResult.message} Panel won't work`);
                return false;
            }

            // Last messages
            (function (lastMessages) {
                if (!lastMessages) {
                    logError("Last messages setting isn't provided. Messages won't be loaded while opening online panel!");
                    return;
                }

                const { limit } = lastMessages;
                let { type } = lastMessages;

                if (!type) {
                    logError("Last messages type isn't set! Last messages won't work");
                    return;
                }

                type = type.toLowerCase();
                if (!["count", "time", "all"].includes(type)) {
                    logError("Last messages type is incorrect! Last messages won't work");
                    return;
                }

                if (type === "all") {
                    main.vars.onlinePanel.messagesLimitType = type;
                    return;
                }


                if (limit === undefined) {
                    logError("Last messages limit isn't set! Last messages won't work");
                    return;
                }

                if (isNaN(limit)) {
                    logError("Last messages limit is incorrect! Last messages won't work");
                    return;
                }

                main.vars.onlinePanel.messagesLimitType = type;
                main.vars.onlinePanel.messagesLimit = limit;
                return true;
            })(onlinePanel['last-messages']);


            // Tab list
            main.vars.onlinePanel.tabList.enabled = (function(tabList) {
                if (!tabList) return false;

                const {enabled} = tabList;
                if (enabled !== true) return false;

                // (function() {
                //     if (interval === undefined) {
                //         logError("Tab list interval isn't set! Will be used '50'");
                //         return;
                //     }
    
                //     if (isNaN(interval)) {
                //         logError("Tab list interval is incorrect! Will be used '50'");
                //         return;
                //     }
                // })();

                // main.vars.onlinePanel.tabList.interval = interval;

                const playersInterval = tabList['players-interval'];
                if (playersInterval === undefined) {
                    logError("Tab list players interval isn't set! Will be used '500'");
                    return true;
                }

                if (isNaN(playersInterval)) {
                    logError("Tab list players interval is incorrect! Will be used '500'");
                    return true;
                }

                main.vars.onlinePanel.tabList.playersInterval = playersInterval;
                return true;
            })(onlinePanel['tab-list']);

            return true;
        })(config["online-panel"]);


        // Function for loggin errors
        function logError(message) {
            if (logErrors === true) logBot(`&3[Config] &c${message}`);
            softError = true;
        }

        return { softError };
    }
}

function checkPort(port) {
    if (port === undefined) {
        return { correct: false, error: null, message: "port isn't set!" };
    }

    if (isNaN(port)) {
        return { correct: false, error: "nan", message: "port must be a number!" };
    }

    if (port < 0) {
        return { correct: false, error: "toolow", message: "port can't be lower than 0!" };
    }

    if (port > 65535) {
        return { correct: false, error: "toohigh", message: "port can't be higher than 65535!" };
    }

    return { correct: true };
}