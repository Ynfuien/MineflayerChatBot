const { logBot } = require("../utils/logger");
const { getBotCommand } = require("../handlers/command.handler");

module.exports = {
    name: "help",
    enable: true,
    usage: "[command]",
    description: "Shows information about commands.",

    /**
     * @param {import('../types.js').Main} main
     * @param {string[]} args
     */
    run (main, args) {
        const arg = args[0]?.toLowerCase();
        if (arg) {
            const command = getBotCommand(arg);
            if (!command) {
                logBot("&cCommand with that name doesn't exist!");
                return;
            }

            logBot(`&3Help for this command:`);
            logBot(`&bName: &9${command.name}`);
            logBot(`&bUsage: &9${command.usage ? command.usage : "none"}`);
            logBot(`&bAliases: &9${command.aliases ? command.aliases.join("&7, &9") : "none"}`);
            logBot(`&bDescription: &9${command.description ? command.description : "none"}`);
            return;
        }

        
        const {list} = main.commands;
        const {prefix} = main.vars.botCommands;

        logBot(`&3Available commands &7(${Object.keys(list).length})&3:`);
        for (const commandName in list) {
            const command = list[commandName];

            logBot(`&9${prefix}${commandName}${command.usage ? ` ${command.usage}` : ''}${command.description ? ` &f- &b${command.description}` : ''}`);
        }
    },

    /**
     * @param {import('../types.js').Main} main
     * @param {string[]} args
     */
    tabCompletion(main, args) {
        if (args.length > 1) return [];

        const { list } = main.commands;

        const arg1 = args[0].toLowerCase();

        const completions = [];
        for (const commandName in list) {
            if (commandName.startsWith(arg1)) completions.push(commandName);
            
            const command = list[commandName];
            if (!command.aliases) continue;
            if (!Array.isArray(command.aliases)) continue;

            command.aliases.forEach(alias => {
                if (alias.startsWith(arg1)) completions.push(alias);
            });
        }

        return completions;
    }
}