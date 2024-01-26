const { logBot } = require('../utils/logger.js');
const { filterElementsThatStartsWith } = require('../utils/YnfuTools.js');

// Yeah, maybe later
module.exports = {
    name: "hotbar",
    enable: true,
    usage: "<change | use | eat> [slot]",
    description: "Command for hotbar manage. - WIP",

    /**
     * @param {import("..").Main} main
     * @param {string[]} args
     */
    async run (main, args) {
        const {bot} = main;


        let arg1 = args.shift();
        if (!arg1) return false;
        arg1 = arg1.toLowerCase();

        // Change
        if (arg1 === "change") {
            if (args.length === 0) {
                logBot("&cYou have to provide slot to change!");
                return;
            }

            const slot = parseInt(args.shift());
            if (isNaN(slot)) {
                logBot("&cSlot must be a number!");
                return;
            }

            if (slot < 0) {
                logBot("&cSlot can't be lower than 0!");
                return;
            }

            if (slot > 8) {
                logBot("&cSlot can't be higher than 8!");
                return;
            }

            bot.setQuickBarSlot(slot);
            logBot(`&bSlot &asuccessfully &bchanged to &3${slot}&b!`);
            return;
        }

        // Use
        if (arg1 === "use") {
            const {quickBarSlot} = bot;
            let slot = quickBarSlot;

            if (args.length !== 0) {
                slot = parseInt(args.shift());
                if (isNaN(slot)) {
                    logBot("&cSlot must be a number!");
                    return;
                }

                if (slot < 0) {
                    logBot("&cSlot can't be lower than 0!");
                    return;
                }

                if (slot > 8) {
                    logBot("&cSlot can't be higher than 8!");
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

        // Eat
        if (arg1 === "eat") {
            const {quickBarSlot, food} = bot;

            if (food === 20) {
                logBot("&cFood is full!");
                return;
            }

            let slot = quickBarSlot;

            if (args.length !== 0) {
                slot = parseInt(args.shift());
                if (isNaN(slot)) {
                    logBot("&cSlot must be a number!");
                    return;
                }

                if (slot < 0) {
                    logBot("&cSlot can't be lower than 0!");
                    return;
                }

                if (slot > 8) {
                    logBot("&cSlot can't be higher than 8!");
                    return;
                }
            }
            
            if (quickBarSlot !== slot) bot.setQuickBarSlot(slot);
            const {heldItem} = bot;
            if (heldItem == null) {
                logBot(`&cThere is no item in slot &4${slot}&c!`);
                return;
            }

            const foods = require('minecraft-data')(bot.version).foodsByName;
            const {name} = heldItem;
            if (!foods[name] && name !== "potion") {
                logBot(`&cItem in slot &4${slot} &ccan't be consumed!`);
                return;
            }

            await bot.consume();
            if (quickBarSlot !== slot) bot.setQuickBarSlot(quickBarSlot);

            logBot(`&bItem in slot &3${slot} &asuccessfully &beaten!`);
            return;
        }

        return false;
    },
    
    /**
     * @param {import("..").Main} main
     * @param {string[]} args
     */
    tabCompletion(main, args) {
        if (!args) return [];
        if (args.length > 2) return [];

        const arg1 = args[0].toLowerCase();

        const subCommands = ["change", "use", "eat"];

        if (args.length === 1) {
            return filterElementsThatStartsWith(subCommands, arg1);
        }

        if (args.length === 2) {
            if (!subCommands.includes(arg1)) {
                return [];
            }

            let slotsStrings = [
                "0", "1", "2", "3", "4", "5", "6", "7", "8"
            ];
            
            return filterElementsThatStartsWith(slotsStrings, args[1]);
        }

        return [];
    }
}