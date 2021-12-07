const { logBot } = require("../utils/logger");

module.exports = {
    name: "help",
    enable: true,
    usage: "[command]",
    description: "Shows commands help.",

    run (main, args) {
        const {list} = main.commands;
        const {prefix} = main.config.commands;

        let arg = args[0];
        if (arg) {
            let command = list[arg.toLowerCase()];
            if (!command) {
                logBot("&cCommand with that name doesn't exist!");
                return;
            }

            logBot(`&3Help for command &b${command.name}&3:`);
            logBot(`&bName: &9${command.name}`);
            logBot(`&bUsage: &9${command.usage ? command.usage : "none"}`);
            logBot(`&bAliases: &9${command.aliases ? command.aliases.join("&7, &9") : "none"}`);
            logBot(`&bDescription: &9${command.description ? command.description : "none"}`);
            return;
        }

        let size = 0;
        for (const key in list) size++;
        
        // let i = 0;
        logBot(`&3Available commands &7(${size})&3:`);
        for (const commandName in list) {
            // i++;
            let cmd = list[commandName];


            logBot(`&9${prefix}${commandName}${cmd.usage ? ` ${cmd.usage}` : ''}${cmd.description ? ` &f- &b${cmd.description}` : ''}`);
        }
    },

    tabCompletion(main, args) {
        if (!args) return [];
        if (args.length !== 1) return [];
        const commands = main.commands.list;

        const arg1 = args[0].toLowerCase();

        let completions = [];
        
        for (const cmdName in commands) {
            if (cmdName.startsWith(arg1)) completions.push(cmdName);
            
            const cmd = commands[cmdName];
            if (!cmd.aliases) continue;
            if (!Array.isArray(cmd.aliases)) continue;
            cmd.aliases.forEach(alias => {
                if (alias.startsWith(arg1)) completions.push(alias);
            });
        }
        return completions;
    }
}