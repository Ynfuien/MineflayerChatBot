const database = require('better-sqlite3')('logs.db');
database.prepare("CREATE TABLE IF NOT EXISTS messages (message TEXT DEFAULT \"\", timestamp INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP)").run();

const webPanel = require('./webpanel/panel.js');
const configManager = require('./utils/configManager.js');

const eventHandler = require('./handlers/event.handler.js');
const {loadCommands} = require('./handlers/command.handler.js');

const { logBot, setup: setupLogger } = require('./utils/logger.js');
const { startBot } = require('./utils/botManager.js');

/**
 * @typedef {{
 *      bot: import('mineflayer').Bot | null,
 *      database: import('better-sqlite3').Database,
 *      commands: {
 *          list: Object.<string, import('./handlers/command.handler.js').BotCommand>,
 *          tabComplete: Object
 *      },
 *      prismarine: {
 *          ChatMessage: import('prismarine-chat').ChatMessage
 *      },
 *      config: {
 *          values: import('./utils/configManager.js').Config,
 *          yawn: YAWN.default
 *      },
 *      vars: {
 *          chatLogs: {
 *              enabled: boolean,
 *              limitType?: string,
 *              limit?: number | string
 *          },
 *          onJoin: {
 *              commands: {timeout: number, message: string}[]
 *          },
 *          autoRejoin: {
 *              enabled: boolean,
 *              timeout: number
 *          },
 *          botCommands: {
 *              enabled: boolean,
 *              prefix: string
 *          },
 *          onlinePanel: {
 *              enabled: boolean,
 *              port: number,
 *              messagesLimitType: string,
 *              messagesLimit: number | string
 *          },
 *          bot: {
 *              joined: boolean,
 *              logPlayers: boolean,
 *              ignoreActionBar: boolean,
 *              restart: boolean,
 *              stop: boolean   
 *          }
 *      }
 * }} Main
 */


(async function() {
    /** @type {Main} */
    const main = {
        bot: null,
        database,
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
                messagesLimit: 0
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
    const configResult = configManager.loadConfig(`${__dirname}/../config.yml`);
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






// const {loadCommands} = require('./handlers/command.handler.js');
// const express = require('./express.js');

// const { logBot, setMain, onStartup } = require('./utils/logger.js');
// const {startBot} = require('./utils/botManager.js');
// const cm = require('./utils/configManager.js');


// (async function(){
//     // Main setup
//     const main = {
//         commands: {
//             list: {},
//             tabComplete: {}
//         },
//         config: null,
//         botOptions: null,
//         temp: {
//             bot: {},
//             config: {
//                 commands: false,
//                 logs: {
//                     enabled: false,
//                     type: "infinity",
//                     limit: null
//                 },
//                 onJoin: {
//                     commands: []
//                 },
//                 autoRejoin: {
//                     enabled: false,
//                     timeout: 10
//                 },
//                 onlinePanel: {
//                     enabled: false,
//                     lastMessages: {
//                         type: "count",
//                         limit: 0
//                     }
//                 }
//             }
//         },
//         bot: null,
//         db: db
//     };


    
//     setMain(main);

//     cm.loadBotOptions(main);
//     onStartup();

    
// })();