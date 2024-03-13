const fs = require('fs');
const ascii = require('ascii-table');

const { logBot } = require('../utils/logger.js');

// Console reading
const readline = require("readline");
const rl = readline.createInterface(process.stdin);

/**
 * @typedef {{
 *      name: string,
 *      enable: boolean,
 *      aliases?: string[],
 *      usage?: string,
 *      description?: string,
 *      run: Function,
 *      tabCompletion: Function
 * }} BotCommand
 */

/** @type {import('../types.js').Main} */
let main;
/** @type {Object.<string, BotCommand>} */
let commands = {};


const self = module.exports = {
    /**
     * @param {import('../types.js').Main} _main 
     */
    loadCommands(_main) {
        main = _main;
        // const {config} = _main;

        const commandFiles = fs.readdirSync(`${__dirname}/../commands`).filter(file => file.endsWith("command.js"));

        logBot(`&aRegistering commands..`);
        const asciiTable = new ascii().setHeading("Command", "Status");
        let count = 0;

        for (const file of commandFiles) {
            const command = require(__dirname + `/../commands/${file}`);

            if (!command.name) {
                // logBot(`&cCommand is missing name!`);

                asciiTable.addRow(file, "❌ -> missing 'name'!");
                continue;
            }

            if (!command.run) {
                // logBot(`&cCommand &e${evecommandnt.name}&c, missing run function!`);
                // logBot(chalk.redBright(`Event ${command.name} !`));

                asciiTable.addRow(file, "❌ -> missing 'run'!");
                continue;
            }
            
            if (typeof command.run !== "function") {
                // logBot(`&cCommand &e${command.name}&c, run must be a function!`);
                
                asciiTable.addRow(file, "❌ -> 'run' isn't a function!");
                continue;
            }

            if (command.enable === false) {
                asciiTable.addRow(file, "❌");
                continue;
            }

            
            asciiTable.addRow(file, "✅");
            commands[command.name] = command;
            count++;
        }

        asciiTable.toString().split('\n').forEach(line => logBot("&#d1d1d1"+line));
        logBot(`&aRegistered &b${count} &acommand(s)!`);

        if (main.vars.botCommands.enabled !== true) {
            logBot(`&cBot commands are not enabled so they won't work!`);
        }

        main.commands.list = commands;

        rl.on("line", (text) => {
            self.executeCommand(text);
        });
    },

    /**
     * Execute command/send message. Used for console and online panel input.
     * Depending on the text, one of the following will happen:
     * - executed bot command
     * - executed Minecraft command
     * - sent chat message
     * @param {string} text
     */
    async executeCommand(text) {
        const {bot} = main;
        const botPrefix = main.vars.botCommands.prefix;

        try {
            //// Minecraft command or chat message
            if (!self.isBotCommand(text)) {
                if (!bot) return logBot("&cBot isn't working!");
                
                // If bot prefix is escaped, remove escape char ('\')
                if (text.startsWith(`\\${botPrefix}`)) text = text.substring(1); 

                bot.chat(text);
                return;
            }
    
            
            //// Bot command
            const args = text.split(' ');
            const commandName = args.shift().substring(botPrefix.length).toLowerCase();
    
            const command = self.getBotCommand(commandName);
            if (command === null) return logBot("&cThere is no such command!");
    
            const result = await command.run(main, args);
            if (result === false) logBot(`&cCorrect command usage: ${botPrefix}${commandName} ${command.usage}`);
        } catch (error) {
            logBot("&cAn error occurred while executing a command!");
            logBot(`&4Command: &f${text}`);
            logBot(`&4Error message: &f${error}`);
            console.log(error);
        }
    },

    /**
     * @param {string} commandName 
     * @returns {BotCommand | null}
     */
    getBotCommand(commandName) {
        const command = commands[commandName];
        if (command) return command;

        for (const name in commands) {
            const cmd = commands[name];
            if (!cmd.aliases) continue;
            if (!cmd.aliases.includes(commandName)) continue;

            return cmd;
        }

        return null;
    },

    /**
     * @param {string} command 
     * @returns {boolean}
     */
    isBotCommand(command) {
        const {enabled, prefix} = main.vars.botCommands;
    
        if (!enabled) return false;
        
        return command.startsWith(prefix);
    }
}