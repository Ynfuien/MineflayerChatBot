const { isBotCommand, getBotCommand } = require('./command.handler.js');

module.exports = {
    /**
     * Gets completions for the current input (in the online panel),
     * usernames, minecraft or bot commands, it's all in here.
     * @param {import('../types.js').Main} main
     * @param {string} text
     * @param {number} timestamp
     * @returns {{type: string, start?: number, length?: number, list: string[]}}
     */
    async getTabCompletions(main, text) {
        const { bot } = main;
        const { prefix } = main.vars.botCommands;

        // Bot command
        if (isBotCommand(text)) return await getBotCommandCompletions(main, text);

        if (!bot) return { type: "usernames", list: [] };

        // Minecraft command
        if (text.startsWith(`\\${prefix}`)) text = text.substring(1);
        if (text.startsWith('/')) return await tabComplete(main, text);

        // Players usernames
        const split = text.split(' ');
        const lastWord = split.pop();
        const list = Object.keys(bot.players).filter(username => username.toLowerCase().startsWith(lastWord));

        return {
            type: "usernames",
            start: split.join(' ').length + (split.length === 0 ? 0 : 1),
            length: lastWord.length,
            list
        };
    }
}

/**
 * @param {import('../types.js').Main} main
 * @param {string} text
 * @returns {{type: string, start: number, length: number, list: string[], prefix: string}}
 */
async function getBotCommandCompletions(main, text) {
    const { list } = main.commands;
    const { prefix } = main.vars.botCommands;

    let args = text.split(' ');
    const start = args.slice(0, -1).join(' ').length + prefix.length;
    const length = args.length > 1 ? args[args.length - 1].length : args[0].length - prefix.length;
    const commandName = args.shift().substring(prefix.length);


    let completionList = await (async function () {
        const completions = [];

        // Bot command list
        if (args.length === 0) {
            for (const cmdName in list) {
                if (cmdName.startsWith(commandName)) completions.push(cmdName);

                const command = list[cmdName];
                if (!command.aliases) continue;
                if (!Array.isArray(command.aliases)) continue;

                command.aliases.forEach(alias => {
                    if (alias.startsWith(cmdName)) completions.push(alias);
                });
            }

            return completions;
        }

        // Subcommands
        const command = getBotCommand(commandName);
        if (!command) return completions;
        if (typeof command.tabCompletion !== "function") return completions;

        return await command.tabCompletion(main, args);
    })();

    if (!completionList) completionList = [];
    completionList.sort();

    return {
        type: "bot-command",
        start, length,
        list: completionList,
        prefix: prefix,
    };
}

/**
 * Sends tab complete packet, waits for it, and returns it in a needed form.
 * @param {import('..').Main} main
 * @param {string} text
 * @param {number} timeout
 * @returns {{type: string, start?: number, length?: number, list: string[]}}
 */
async function tabComplete(main, text, timeout = "auto") {
    const { bot } = main;
    const block = bot.blockAtCursor();

    // Sending packet
    bot._client.write('tab_complete', {
        text,
        assumeCommand: false,
        lookedAtBlock: block ? block.position : undefined
    });

    // Setting a timeout
    if (timeout === "auto") timeout = (main.bot?.player?.ping || 10) + 10;

    // Timeout promise
    let interval = null;
    const timeoutPromise = new Promise((resolve) => setTimeout(() => {
        resolve(null);
        clearInterval(interval);
    }, timeout));

    // Wait for a packet promise
    // (An actual event listener is in tabComplete.event.js)
    const eventPromise = new Promise((resolve) => {
        interval = setInterval(() => {
            const { lastPacket } = main.commands.tabComplete;
            if (lastPacket == null) return;

            main.commands.tabComplete.lastPacket = null;
            resolve(lastPacket);
            clearInterval(interval);
        });
    });

    // Results
    const result = await Promise.race([eventPromise, timeoutPromise]);

    if (result) {
        return {
            type: "minecraft-command",
            start: result.start,
            length: result.length,
            list: result.matches.map(entry => entry.match)
        };
    }

    return { type: "minecraft-command", list: [] };
}