// const ascii = require('ascii-table');

const {logBot} = require('../utils/logger.js');
const {filterElementsThatStartsWith} = require('../utils/YnfuTools.js');

module.exports = {
    name: "closewindow",
    enable: true,
    aliases: ["close"],
    description: "Closes currently opened window.",

    async run (main, args) {
        const {bot} = main;

        const window = bot.currentWindow;
        if (!window) {
            logBot("&cBot doesn't have any windows opened!")
            return;
        }

        bot.closeWindow(window);
        
        logBot(`&aClosed a window!`);
        return;
    },
    
    tabCompletion(main, args) {
        // if (!args) return [];
        // if (args.length > 2) return [];

        // const arg1 = args[0].toLowerCase();

        // if (args.length === 1) {
        //     return filterElementsThatStartsWith(["clear", "leftclick", "rightclick"], arg1);
        // }

        // if (args.length === 2) {
        //     if (arg1 !== "leftclick" && arg1 !== "rightclick") {
        //         return [];
        //     }

        //     const {bot} = main;
        //     const arg2 = args[1];

        //     let slotsCount = bot.inventory.slots.length;
        //     if (bot.currentWindow) slotsCount += bot.currentWindow.slots.length;

        //     let slotsStrings = [];
        //     for (let i = 0; i < slotsCount; i++) {
        //         slotsStrings.push(i.toString());
        //     }
            
        //     return filterElementsThatStartsWith(slotsStrings, arg2);
        // }

        return [];
    }
}

// function getItem(slot) {
//     if (!slot) {
//         return "";
//     }

//     return `x${slot.count} ${slot.name}`;
// }