const { logBot } = require('../utils/logger.js');

module.exports = {
    name: "hotbar",
    enable: true,
    usage: "<set | use | consume | swingarm> [slot]",
    description: "Command for hotbar manage.",

    /**
     * @param {import('../types.js').Main} main
     * @param {string[]} args
     */
    async run(main, args) {
        const { bot } = main;
        if (!bot) {
            logBot("&cBot isn't on!")
            return;
        }

        if (args.length === 0) return false;
        const arg1 = args[0].toLowerCase();

        // Set
        if (arg1 === "set") {
            if (args.length < 2) {
                logBot("&cYou have to provide slot to set!");
                return;
            }

            const slot = parseInt(args[1]);
            if (isNaN(slot)) {
                logBot("&cSlot must be a number!");
                return;
            }

            if (slot < 0 || slot > 8) {
                logBot("&cSlot number must be in range of 0-8!");
                return;
            }

            bot.setQuickBarSlot(slot);
            logBot(`&bSlot &asuccessfully &bset to &3${slot}&b!`);
            return;
        }

        // Use
        if (arg1 === "use") {
            const { quickBarSlot } = bot;
            let slot = quickBarSlot;

            if (args.length > 1) {
                slot = parseInt(args[1]);
                if (isNaN(slot)) {
                    logBot("&cSlot must be a number!");
                    return;
                }

                if (slot < 0 || slot > 8) {
                    logBot("&cSlot number must be in range of 0-8!");
                    return;
                }
            }

            if (quickBarSlot !== slot) bot.setQuickBarSlot(slot);
            bot.activateItem();
            bot.deactivateItem();
            if (quickBarSlot !== slot) bot.setQuickBarSlot(quickBarSlot);

            logBot(`&bItem in slot &3${slot} &asuccessfully &bused!`);
            return;
        }

        // Swing arm
        if (["swingarm", "swing"].includes(arg1)) {
            const { quickBarSlot } = bot;
            let slot = quickBarSlot;

            if (args.length > 1) {
                slot = parseInt(args[1]);
                if (isNaN(slot)) {
                    logBot("&cSlot must be a number!");
                    return;
                }

                if (slot < 0 || slot > 8) {
                    logBot("&cSlot number must be in range of 0-8!");
                    return;
                }
            }

            if (quickBarSlot !== slot) bot.setQuickBarSlot(slot);
            bot.swingArm();
            if (quickBarSlot !== slot) bot.setQuickBarSlot(quickBarSlot);

            logBot(`&aSuccessfully &bswang the hand!`);
            return;
        }

        // Consume
        if (arg1 === "consume") {
            const { quickBarSlot } = bot;

            let slot = quickBarSlot;
            if (args.length > 1) {
                slot = parseInt(args[1]);
                if (isNaN(slot)) {
                    logBot("&cSlot must be a number!");
                    return;
                }

                if (slot < 0 || slot > 8) {
                    logBot("&cSlot number must be in range of 0-8!");
                    return;
                }
            }

            if (quickBarSlot !== slot) bot.setQuickBarSlot(slot);
            const { heldItem } = bot;
            if (heldItem == null) {
                logBot(`&cThere is no item in slot &4${slot}&c!`);
                return;
            }

            const foods = require('minecraft-data')(bot.version).foodsByName;
            const { name } = heldItem;
            if (!foods[name] && name !== "potion") {
                logBot(`&cItem in slot &4${slot} &ccan't be consumed!`);
                return;
            }

            await bot.consume();
            if (quickBarSlot !== slot) bot.setQuickBarSlot(quickBarSlot);

            logBot(`&bItem in slot &3${slot} &asuccessfully &bconsumed!`);
            return;
        }

        return false;
    },

    /**
     * @param {import('../types.js').Main} main
     * @param {string[]} args
     */
    tabCompletion(main, args) {
        if (args.length > 2) return [];

        const subCommands = ["set", "use", "consume", "swingarm"];

        // First arg
        const arg1 = args[0].toLowerCase();
        if (args.length === 1) {
            return subCommands.filter(element => element.startsWith(arg1));
        }

        // Second
        if (!subCommands.includes(arg1)) return [];

        const slotsStrings = ["0", "1", "2", "3", "4", "5", "6", "7", "8"];
        return slotsStrings.filter(element => element.startsWith(args[1]));
    }
}