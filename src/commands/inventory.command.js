const { logBot } = require('../utils/logger.js');

// Also, not now
module.exports = {
    name: "inventory",
    enable: true,
    usage: "<clear | leftclick | rightclick> [slot]",
    aliases: ["inv"],
    description: "Inventory functions. - WIP",

    /**
     * @param {import("..").Main} main
     * @param {string[]} args
     */
    run (main, args) {
        const {bot} = main;


        let arg1 = args[0];
        if (!arg1) return false;
        arg1 = arg1.toLowerCase();

        // Clear
        if (arg1 === "clear") {
            (async function(){
                let slots = bot.inventory.slots;
                for (let slot of slots) {
                    if (!slot) continue;
                    await bot.tossStack(slot);
                }
            })();
            return;
        }

        // Show
        // if (arg1 === "show") {
        //     const table = new ascii().setHeading('', '1','2','3','4','5','6','7','8','9');


        //     let inventory = bot.inventory;
        //     let s = inventory.slots;

        //     for (let i = 0; i < s.length; i+=9) {
        //         table.addRow(i / 9 + 1, getItem(s[i]), getItem(s[i+1]), getItem(s[i+2]), getItem(s[i+3]), getItem(s[i+4]), getItem(s[i+5]), getItem(s[i+6]), getItem(s[i+7]), getItem(s[i+8]));
        //     }

        //     console.log(table.toString());
        //     return;
        // }

        // Left and right click
        if (arg1 === "leftclick" || arg1 === "rightclick") {
            let slot = args[1];
            if (slot === undefined) {
                logBot("&cYou have to provide slot to click!");
                return;
            }

            slot = parseInt(slot);
            if (isNaN(slot)) {
                logBot("&cProvided slot must be a number!");
                return;
            }

            // bot.inventory

            if (arg1 === "leftclick") {
                bot.simpleClick.leftMouse(slot);
                return;
            }
            
            bot.simpleClick.rightMouse(slot);
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

        if (args.length === 1) {
            return ["clear", "leftclick", "rightclick"].filter(element => element.startsWith(arg1));
        }

        if (args.length === 2) {
            if (arg1 !== "leftclick" && arg1 !== "rightclick") {
                return [];
            }

            const {bot} = main;
            const arg2 = args[1];

            let slotsCount = bot.inventory.slots.length;
            if (bot.currentWindow) slotsCount += bot.currentWindow.slots.length;

            let slotsStrings = [];
            for (let i = 0; i < slotsCount; i++) {
                slotsStrings.push(i.toString());
            }
            
            return slotsStrings.filter(element => element.startsWith(arg2));
        }

        return [];
    }
}

// function getItem(slot) {
//     if (!slot) {
//         return "";
//     }

//     return `x${slot.count} ${slot.name}`;
// }