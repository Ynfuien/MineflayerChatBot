const { logBot } = require('../utils/logger.js');

module.exports = {
    name: "inventory",
    enable: true,
    usage: "<clear | leftclick | rightclick> [slot]",
    aliases: ["inv"],
    description: "Inventory functions.",

    /**
     * @param {import("..").Main} main
     * @param {string[]} args
     */
    async run(main, args) {
        const { bot } = main;

        if (args.length === 0) return false;
        const arg1 = args[0].toLowerCase();

        // Clear
        if (arg1 === "clear") {
            const arg2 = args[1];
            if (!arg2 || !["y", "yes", "-y"].includes(arg2)) {
                logBot("&cAre you sure, you want to drop all the items, from your inventory?");
                logBot(`&cType &4${main.config.values['bot-commands'].prefix}${this.name} clear -y &cto confirm.`);
                return;
            }

            const { slots } = bot.inventory;
            for (const slot of slots) {
                if (!slot) continue;
                await bot.tossStack(slot);
            }

            return;
        }

        // Left and right click
        if (arg1 === "leftclick" || arg1 === "rightclick") {
            if (args.length < 2) {
                logBot("&cYou have to provide slot to set!");
                return;
            }

            const slot = parseInt(args[1]);
            if (isNaN(slot)) {
                logBot("&cSlot must be a number!");
                return;
            }

            if (arg1 === "leftclick") {
                bot.simpleClick.leftMouse(slot);
                logBot(`&bLeft-clicked slot &3${slot}&a!`);
                return;
            }

            bot.simpleClick.rightMouse(slot);
            logBot(`&bRight-clicked slot &3${slot}&a!`);
            return;
        }

        return false;
    },

    /**
     * @param {import("..").Main} main
     * @param {string[]} args
     */
    tabCompletion(main, args) {
        if (args.length > 2) return [];

        // First arg
        const arg1 = args[0].toLowerCase();
        if (args.length === 1) {
            return ["clear", "leftclick", "rightclick"].filter(element => element.startsWith(arg1));
        }


        // Second
        if (!["leftclick", "rightclick"].includes(arg1)) return [];

        const { bot } = main;
        const arg2 = args[1];

        let slotsCount = bot.inventory.slots.length;
        if (bot.currentWindow) slotsCount += bot.currentWindow.slots.length;

        const slotsStrings = [];
        for (let i = 0; i < slotsCount; i++) {
            slotsStrings.push(i.toString());
        }

        return slotsStrings.filter(element => element.startsWith(arg2));
    }
}