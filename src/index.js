require('dotenv').config();

const database = require('better-sqlite3')('logs.db');
// Message types:
// 0 - bot
// 1 - minecraft
database.prepare("CREATE TABLE IF NOT EXISTS messages (message TEXT DEFAULT \"\", timestamp INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP, type INTEGER DEFAULT 0)").run();

const webPanel = require('./webpanel/webPanel.js');
const configManager = require('./utils/configManager.js');

const {loadCommands} = require('./handlers/command.handler.js');

const { logBot, setup: setupLogger } = require('./utils/logger.js');
const { startBot } = require('./utils/botManager.js');


(async function() {
    /** @type {Main} */
    const main = {
        bot: null,
        dev: process.env.DEV_MODE === "true" ? true : false,
        database,
        webPanel: {},
        commands: {
            list: {},
            tabComplete: {}
        },
        prismarine: {},
        vars: {
            chatLogs: { enabled: false },
            onJoin: { commands: [] },
            autoRejoin: {
                enabled: false,
                timeout: 10
            },
            botCommands: { enabled: false },
            onlinePanel: {
                enabled: false,
                messagesLimitType: "count",
                messagesLimit: 0,
                tabList: {
                    enabled: false,
                    interval: 50,
                    playersInterval: 500
                }
            },
            bot: {
                joined: false,
                logPlayers: false,
                ignoreActionBar: false
            }
        }
    };
    
    setupLogger(main);

    // Loading config from file
    logBot(`&bLoading config..`);
    const configResult = configManager.loadConfig(main);
    if (!configResult.success) {
        logBot(`&cAn error occured while loading config file! Fix it and start the bot again.\n${configResult.error}`);
        process.exit(1);
    }
    main.config = configResult.config;
    
    // Checking config for user's mistakes
    const checkConfig = configManager.checkConfig(main);
    if (checkConfig === false) process.exit(1);
    
    let timeout = 0;
    if (checkConfig.softError) {
        timeout = 5 * 1000;
        logBot("&cThere is an error in config. Best for you will be fixing it and reloading configuration!");
    } else {
        logBot("&bConfig &asuccessfully &bloaded!");
    }

    
    logBot("&bCreating bot..");
    startBot(main);

    setTimeout(async () => {
        // Online panel
        if (main.vars.onlinePanel.enabled) {
            await webPanel.setup(main);
        }

        // Commands setup
        loadCommands(main);
    }, timeout);
})();
