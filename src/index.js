const {loadCommands} = require('./handlers/command.handler.js');
const express = require('./express.js');

const { logBot, setMain, onStartup } = require('./utils/logger.js');
const {startBot} = require('./utils/botManager.js');
const cm = require('./utils/configManager.js');

// Database setup
const db = require('better-sqlite3')('logs.db');
// Creating main table in db if not exist
db.prepare("CREATE TABLE IF NOT EXISTS messages (message TEXT DEFAULT \"\", timestamp INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP)").run();

(async function(){
    // Main setup
    const main = {
        commands: {
            list: {},
            tabComplete: {}
        },
        config: null,
        botOptions: null,
        temp: {
            bot: {},
            config: {
                commands: false,
                logs: {
                    enabled: false,
                    type: "infinity",
                    limit: null
                },
                onJoin: {
                    commands: []
                },
                autoRejoin: {
                    enabled: false,
                    timeout: 10
                },
                onlinePanel: {
                    enabled: false,
                    lastMessages: {
                        type: "count",
                        limit: 0
                    }
                }
            }
        },
        bot: null,
        db: db
    };

    
    // Loading config from file
    logBot(`&bLoading config..`);
    const configLoading = cm.loadConfig(main);
    if (!configLoading.success) {
        logBot(`&cAn error occured when loading config file! Fix it and start script again. Error: ${configLoading.error}`);
        process.exit(1);
    }

    // Checking config for user's mistakes
    const checkConfig = cm.checkConfig(main);
    if (checkConfig === false) {
        process.exit(1);
    }
    
    setMain(main);

    cm.loadBotOptions(main);
    onStartup();

    let timeout = 0;
    if (checkConfig.softError) {
        timeout = 5 * 1000;
        logBot("&cThere is an error in config. Best for you will be fixing it and reloading configuration!");
    } else {
        logBot("&bConfig &asuccessfully &bloaded!");
    }
    

    setTimeout(async () => {
        // Online panel
        if (main.temp.config.onlinePanel.enabled) {
            await express(main);
        }

        // Bot creation
        logBot("&bCreating bot..");
        startBot(main);

        // Commands setup
        loadCommands(main);
    }, timeout);
})();