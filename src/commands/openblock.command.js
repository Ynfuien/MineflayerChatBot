const { logBot } = require('../utils/logger.js');

const BLOCK_CONTAINERS = [
    "chest",
    "trapped_chest",
    "ender_chest",
    "barrel",
    "shulker_box",
    "white_shulker_box",
    "orange_shulker_box",
    "magenta_shulker_box",
    "light_blue_shulker_box",
    "yellow_shulker_box",
    "lime_shulker_box",
    "pink_shulker_box",
    "gray_shulker_box",
    "light_gray_shulker_box",
    "cyan_shulker_box",
    "purple_shulker_box",
    "blue_shulker_box",
    "brown_shulker_box",
    "green_shulker_box",
    "red_shulker_box",
    "black_shulker_box"
];

module.exports = {
    name: "openblock",
    enable: true,
    usage: "<block> [distance]",
    aliases: ["open"],
    description: "Opens block's inventory.",

    /**
     * @param {import("..").Main} main
     * @param {string[]} args
     */
    async run (main, args) {
        const {bot} = main;
        
        for (const blockName in bot.registry.blocksByName) {
            if (blockName.includes("shulker")) console.log(blockName);
        }
        console.log(bot.registry.blocksByName["chest"]);
        console.log(bot.registry.blocksByName["stone"]);
        
        if (args.length == 0) return false;

        const blockName = args[0].toLowerCase();
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
            logBot(`&cCouldn't find a ${block.displayName} in distance of ${distance} block(s)!`);
            return;
        }

        
        // Open it
        await bot.openContainer(foundBlock);
        
        logBot(`&aOpened ${block.displayName}'s inventory!`);
        return;
    },
    
    /**
     * @param {import("..").Main} main
     * @param {string[]} args
     */
    tabCompletion(main, args) {
        const completions = [];
        if (!args) return completions;
        if (args.length > 2) return completions;

        const arg1 = args[0].toLowerCase();
        if (args.length === 1) {
            for (const blockName of BLOCK_CONTAINERS) {
                if (blockName.startsWith(arg1)) completions.push(blockName);
            }

            return completions;
        }

        const arg2 = args[1].toLowerCase();
        for (const completion of ["1", "2", "3", "4", "5"]) {
            if (completion.startsWith(arg2)) completions.push(completion);
        }

        return completions;
    }
}