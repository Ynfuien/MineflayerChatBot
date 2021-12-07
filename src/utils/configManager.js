const YAWN = require('yawn-yaml/cjs');
const yaml = require('js-yaml');
const { readFileSync, existsSync } = require('fs');

const { logBot } = require('./logger.js');
const { isKeyExist } = require('./YnfuTools.js');

module.exports = {
    checkConfig(main, logErrors = true) {
        const {config} = main;
        let softError = false;

        // Check for just config
        if (!config) {
            logError("&3[Config] &cConfig data is incorrect!");
            return false;
        }

        // Check obligatory sections
        for (let sectionkey of ["server.host", "login.username"]) {
            if (isKeyExist(config, sectionkey) != undefined) continue;

            logError(`Config field '${sectionkey}' isn't set! Script can't work without it. Correct it and start script again`);
            return false;
        }

        // Checks for each section
        let result;

        // Server
        result = (function(server) {
            const {host, port, version} = server;
            
            // Check host
            let ip = host.toLowerCase();
            let allowed = [
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
            for (let check of allowed) {
                if (ip.match(new RegExp(check, 'g'))) {
                    correctHost = true;
                    break;
                }
            }

            if (!correctHost) {
                logError("Provided server host is incorrect! Correct it and restart script");
                return false;
            }

            // Check for port
            if (port) {
                const correctPort = checkPort(port);
                if (!correctPort.correct) {
                    logError(`Server ${correctPort.message} Correct it and restart script`);
                    return false;
                }
            }

            // Check version
            if (version) {
                if (typeof version !== "string") {
                    logError("Minecraft version must be string! Correct it and restart script");
                    return false;
                }

                let supportedVersions = [
                    "1\\.8(\\.[1-9]|)",
                    "1\\.9(\\.[1-4]|)",
                    "1\\.10(\\.[1-2]|)",
                    "1\\.11(\\.[1-2]|)",
                    "1\\.12(\\.[1-2]|)",
                    "1\\.13(\\.[1-2]|)",
                    "1\\.14(\\.[1-4]|)",
                    "1\\.15(\\.[1-2]|)",
                    "1\\.16(\\.[1-5]|)",
                    "1\\.17(\\.1|)"
                ];

                for (let supVersion of supportedVersions) {
                    if (version.match(new RegExp(`^${supVersion}$`, 'g'))) break;
                    if (version.match(new RegExp("1\\.[0-7](\\.\\d(\\d|)|)", 'g'))) {
                        logError("Provided minecraft version isn't supported! Privide another version and start script again");
                        return false;
                    }
                    logError("Provided minecraft version is incorrect! Correct it and restart script");
                    return false;
                }

            }

        })(config.server);
        if (result === false) return false;

        // Login
        result = (function(login) {
            const {username, password} = login;
            let {auth} = login;
            
            // Check username
            if (!username.match(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/g)) {
                if (!username.match(/^[a-z0-9_]{3,16}$/gi)) {
                    logError("Provided username is incorrect! Correct it and restart script");
                    return false;
                }
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

                let lowerCase = auth.toLowerCase();
                if (lowerCase != auth) {
                    auth = lowerCase;
                    main.config.login.auth = auth;
                }

                if (auth !== "microsoft" && auth !== "mojang") {
                    logError("Provided authorization is incorrect! Avaiable authorization options are: microsoft, mojang");
                    return false;
                }
            }


        })(config.login);
        if (result === false) return false;

        // Commands
        main.temp.config.commands = (function(commands) {
            if (!commands) return false;

            const {enabled, prefix} = commands;
            if (enabled !== true) return false;

            if (!prefix) {
                logError("Prefix for commands is incorrect! Commands won't work unless you correct it");
                return false;
            }

            return true;
        })(config.commands);

        // Chat
        main.temp.config.logs.enabled = (function(chat) {
            if (!chat) return false;
            
            let ignoredMessages = chat["ignored-messages"];
            if (ignoredMessages) {
                if (!Array.isArray(ignoredMessages)) {
                    logError("Ignored messages must be an array!");
                }
            }

            // Logs
            const {logs} = chat;

            if (!logs) return false;
            if (logs.enabled !== true) return false;
            
            // Logs limit type
            let type = (function(type){
                if (!type) {
                    logError("Chat logs limit type isn't set! Will be used type 'infinity'");
                    return "infinity";
                }

                if (typeof type !== "string") {
                    logError("Chat logs limit type must be a string! Will be used type 'infinity'");
                    return "infinity";
                }

                let lowerCase = type.toLowerCase();
                if (lowerCase !== type) {
                    type = lowerCase;
                }
                
                if (!["count", "time", "infinity"].includes(type)) {
                    logError("Provided chat logs limit type is incorrect! Will be used type 'infinity'");
                    return "infinity";
                }

                return type;
            })(logs["limit-type"]);
            

            main.temp.config.logs.type = type;
            if (type === "infinity") {
                return true;
            }
            
            // Logs limit
            return (function(limit){
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

                main.temp.config.logs.limit = limit;
                return true;
            })(logs.limit);
        })(config.chat);

        // On join
        main.temp.config.onJoin.messages = (function(onJoin){
            if (!onJoin) return [];
            if (!onJoin.messages) return [];

            const {messages} = onJoin;
            if (!Array.isArray(messages)) {
                logError("On join messages must be an array!");
                return [];
            }
            
            let correctMessages = [];

            const pattern = new RegExp("\\d+:.+", 'g');
            for (const message of messages) {
                if (!message.match(pattern)) {
                    logError(`Message '${message}' doesn't match pattern! Correct it to work`);
                    continue;
                }

                correctMessages.push(message);
            }

            return correctMessages;
        })(config["on-join"]);

        // Auto rejoin
        main.temp.config.autoRejoin.enabled = (function(autoRejoin) {
            if (!autoRejoin) return false;

            const {enabled} = autoRejoin;
            if (enabled !== true) return false;

            let correctTimeout = (function(timeout){
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
            })(autoRejoin.timeout);

            if (correctTimeout === true) {
                main.temp.config.autoRejoin.timeout = autoRejoin.timeout;
            }
            return true;
        })(config["auto-rejoin"]);

        // Online panel
        main.temp.config.onlinePanel.enabled = (function(onlinePanel) {
            if (!onlinePanel) return false;

            const {enabled, port} = onlinePanel;
            if (enabled !== true) return false;

            const correctPort = checkPort(port);
            if (!correctPort.correct) {
                logError(`Online panel ${correctPort.message} Panel won't work`);
                return false;
            }

            // Last messages
            const result = (function(lastMessages){
                if (!lastMessages) {
                    logError("Last messages setting isn't provided, so messages won't be loaded while openin panel!");
                    return false;
                }

                const {limit} = lastMessages;
                let {type} = lastMessages;

                if (!type) {
                    logError("Last messages type isn't set! Last messages won't work");
                    return false;
                }

                type = type.toLowerCase();

                if (!["count", "time", "all"].includes(type)) {
                    logError("Last messages type is incorrect! Last messages won't work");
                    return false;
                }

                if (type === "all") {
                    main.temp.config.onlinePanel.lastMessages.type = type;
                    return true;
                }


                if (limit === undefined) {
                    logError("Last messages limit isn't set! Last messages won't work");
                    return false;
                }

                if (isNaN(limit)) {
                    logError("Last messages limit is incorrect! Last messages won't work");
                    return false;
                }

                main.temp.config.onlinePanel.lastMessages.type = type;
                main.temp.config.onlinePanel.lastMessages.limit = limit;
                return true;
            })(onlinePanel['last-messages']);

            if (result === false) {
                main.temp.config.onlinePanel.lastMessages.type = "count";
                main.temp.config.onlinePanel.lastMessages.limit = 0;
            }

            return true;
        })(config["online-panel"]);

        // Function for loggin errors
        function logError(message) {
            if (logErrors === true) logBot(`&3[Config] &c${message}`);
            softError = true;
        }

        return {softError: softError};
    },

    loadConfig(main) {
        const configFilePath = `${__dirname}/../../config.yml`;
        if (!existsSync(configFilePath)) {
            return {success: false, error: "Config file doesn't exist!"};
        }

        try {
            var fileContent = readFileSync(configFilePath, 'utf-8')
        } catch (e) {
            return {success: false, error: e};
        }

        try {
            const config = yaml.load(fileContent);
            main.config = config;

            const yawn = new YAWN(fileContent);
            main.yawn = yawn;
        } catch (e) {
            return {success: false, error: e};
        }
        
        
        return {success: true};
    },

    loadBotOptions(main) {
        const {config} = main;
        
        let options = {};
        for (const first of [config.server, config.login]) {
            for (const key in first) {
                if (first[key]) {
                    options[key] = first[key];
                }
            }
        }

        main.botOptions = options;
    }
}

function checkPort(port) {
    if (port === undefined) {
        return {correct: false, error: null, message: "port isn't set!"};
    }
    
    if (isNaN(port)) {
        return {correct: false, error: "nan", message: "port must be a number!"};
    }

    if (port < 0) {
        return {correct: false, error: "toolow", message: "port can't be lower than 0!"};
    }

    if (port > 65535) {
        return {correct: false, error: "toohigh", message: "port can't be higher than 65535!"};
    }

    return {correct: true};
}