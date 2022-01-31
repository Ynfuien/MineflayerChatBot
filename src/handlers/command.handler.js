const fs = require('fs');
const {logBot} = require('../utils/logger.js');
const {isKeyExist} = require('../utils/YnfuTools.js');
const ascii = require('ascii-table');

// Console read text
const readline = require("readline");
const rl = readline.createInterface(process.stdin);


const table = new ascii().setHeading("Command", "Load status");
let _main = null;
let commands = {};


const self = module.exports = {
    loadCommands(main) {
        _main = main;
        const {config} = main;

        const commandFiles = fs.readdirSync(__dirname + "/../commands").filter(file => file.endsWith("command.js"));

        logBot(`&aRegistering commands..`);
        let count = 0;
        for (const file of commandFiles) {
            const command = require(__dirname + `/../commands/${file}`);

            if (!command.name) {
                logBot(`&cCommand missing name!`);

                table.addRow(file, "❌ -> missing 'name'!");
                continue;
            }

            if (!command.run) {
                logBot(`&cCommand &e${evecommandnt.name}&c, missing run function!`);
                logBot(chalk.redBright(`Event ${command.name} !`));

                table.addRow(file, "❌ -> missing 'run'!");
                continue;
            }
            
            if (typeof command.run !== "function") {
                logBot(`&cCommand &e${command.name}&c, run must be a function!`);
                
                table.addRow(file, "❌ -> 'run' is not function!");
                continue;
            }

            if (command.enable === false) {
                table.addRow(file, "❌");
                continue;
            }

            
            table.addRow(file, "✅");
            commands[command.name] = command;
            count++;
        }

        table.toString().split('\n').forEach(line => logBot("&#d1d1d1"+line));
        logBot(`&aRegistered &b${count} &acommand(s)!`);

        if (isKeyExist(config, "commands.enabled") !== true) {
            logBot(`&cBot commands are not enabled so thay won't work!`);
        }

        main.commands.list = commands;

        rl.on("line", (text) => {
            self.executeCommand(text);
        });
    },

    executeCommand(text) {
        const {bot, config} = _main;

        try {
            const botCommand = self.isBotCommand(text);
            if (!botCommand.botCommand) {
                if (!bot) {
                    return logBot("&cBot isn't working!");
                }
                
                bot.chat(botCommand.command);
                return;
            }
    
    
            let args = text.split(' ');
            const commandName = args.shift().substring(config.commands.prefix.length).toLowerCase();
    
            const cmd = self.getCommand(commandName);
            if (!cmd.command) return logBot(`&c${cmd.error}`);
            const {command} = cmd;
    
            const result = command.run(_main, args);
            if (result === false) {
                logBot(`&cCorrect command usage: ${config.commands.prefix}${commandName} ${command.usage}`);
            }
        } catch (error) {
            logBot("&cAn error occurred while executing a command!");
            logBot(`&4Command: &f${text}}`);
            logBot(`&4Error message: &f${error}`);
            console.log(error);
        }
    },

    getCommand(name) {
        let command = commands[name];
        if (!command) {
            for (const commandName in commands) {
                const cmd = commands[commandName];
                if (!cmd.aliases) continue;

                if (!cmd.aliases.includes(name)) continue;

                command = cmd;
            }

            if (!command) {
                return {command: null, error: "There is no such command!"};
            }
        }

        return {command: command};
    },

    isBotCommand(command) {
        const {config, temp} = _main;
    
        if (!temp.config.commands) {
            return {botCommand: false, command: command};
        }
            
        const prefix = config.commands.prefix;
        if (!command.startsWith(prefix)) {
            if (command.startsWith('\\' + prefix)) {
                command = command.substr(1);
            }
    
            return {botCommand: false, command: command};
        }
    
        return {botCommand: true};
    }
}