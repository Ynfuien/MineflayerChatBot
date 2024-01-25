// const ascii = require('ascii-table');

const {logBot} = require('../utils/logger.js');
const {filterElementsThatStartsWith} = require('../utils/YnfuTools.js');

module.exports = {
    name: "openwindow",
    enable: true,
    usage: "<block> [distance]",
    aliases: ["open"],
    description: "Opens block's inventory.",

    async run (main, args) {
        const {bot} = main;

        if (args.length == 0) return false;

        const blockName = args[0];
        const block = bot.registry.blocksByName[blockName];
        if (!block) {
            logBot("&cProvided block is incorrect!");
            return;
        }

        let distance = 3;
        const arg2 = parseInt(args[1]);
        if (!isNaN(arg2)) distance = arg2;  

        const foundBlock = bot.findBlock({
            maxDistance: distance,
            matching: block.id
        });
        if (!foundBlock) {
            logBot(`&cCouldn't find a ${block.displayName} in distance of ${distance}!`);
            return;
        }

        // Open it
        const window = await bot.openContainer(foundBlock);
        
        
        logBot(`&aOpened ${block.displayName}'s inventory!`);
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