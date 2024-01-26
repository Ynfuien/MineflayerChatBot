const { writeBotTabCompletionPacket } = require('../utils/YnfuTools.js');
const { getBotCommand, isBotCommand } = require('./command.handler.js');

let currentTabCompletionTransactionId = 0;
let lastCompletionTimestamp = 0;

module.exports = {
    /**
     * @param {import("..").Main} main
     * @param {string} args
     * @param {any} socket
     * @param {number} timestamp
     */
    async getTabCompletions(main, command, socket, timestamp) {
        const {bot} = main;
        const {prefix} = main.vars.botCommands;

        lastCompletionTimestamp = timestamp;
        if (typeof command !== "string") return {list: [], type: "usernames"};

        if (bot) {
            
            // Not bot command
            if (!isBotCommand(command)) {
                if (command.startsWith(`\\${prefix}`)) command = command.substring(1);

                // Minecraft command
                if (command.startsWith('/')) {
                    currentTabCompletionTransactionId++;
                    if (currentTabCompletionTransactionId > 30) {
                        main.commands.tabComplete = {};
                        currentTabCompletionTransactionId = 1;
                    }
                    const transId = currentTabCompletionTransactionId;

                    writeBotTabCompletionPacket(bot, command.substr(1), transId);

                    const completions = await new Promise(resolve => {
                        let respond = false;

                        main.commands.tabComplete[transId] = (packet) => {
                            if (lastCompletionTimestamp > Date.now()) return;
                            packet.start = packet.start + 1;
                            const {start, length, matches} = packet;

                            let completion = {start, length,
                                list: matches,
                                type: "minecraft-command"
                            };
                            
                            if (!respond) {
                                respond = true;
                                resolve(completion);
                                return;
                            }
    
                            socket.emit("tab-completions", completion);
                        };
                        
                        setTimeout(() => {
                            if (respond) return;

                            respond = true;
                            resolve({list: [], type: "minecraft-command"});
                        }, 100);
                    });

                    return completions;
                }

                // Players usernames
                const split = command.split(' ');
                let startIndex = split.slice(0, -1).join(' ').length + (split.length > 1 ? 1 : 0);
                
                const lastWord = split[split.length - 1].toLowerCase();

                const usernames = Object.keys(bot.players).filter(
                    username => username.toLowerCase().startsWith(lastWord)
                    );
                
                return {
                    list: usernames,
                    type: "usernames",
                    start: startIndex,
                    length: lastWord.length
                };
            }
        }

        // Bot command
        if (!command.startsWith(prefix)) return {list: [], type: "usernames"};

        const {list} = main.commands;

        let args = command.split(' ');
        const start = args.slice(0, -1).join(' ').length + prefix.length;
        const length = args.length > 1 ? args[args.length - 1].length : args[0].length - prefix.length;
        const commandName = args.shift().substr(prefix.length);

        let completions = (function(){
            let completions = [];

            if (args.length === 0) {
                for (const cmdName in list) {
                    if (cmdName.startsWith(commandName)) completions.push(cmdName);
                    
                    const cmd = list[cmdName];
                    if (!cmd.aliases) continue;
                    if (!Array.isArray(cmd.aliases)) continue;
                    cmd.aliases.forEach(alias => {
                        if (alias.startsWith(commandName)) completions.push(alias);
                    });
                }
                return completions;
            }

            const cmd = getBotCommand(commandName);
            if (!cmd.command) {
                return completions;
            }

            if (typeof cmd.command.tabCompletion !== "function") {
                return completions;
            }
            
            return cmd.command.tabCompletion(main, args);
        })();

        completions.sort();
        
        return {list: completions, type: "bot-command", prefix: prefix, start, length};
    }
}