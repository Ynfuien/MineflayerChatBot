const { logBot } = require('../utils/logger.js');

// Didn't have a better way
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
     * @param {import('../types.js').Main} main
     * @param {string[]} args
     */
    async run(main, args) {
        const { bot } = main;
        if (!bot) {
            logBot("&cBot isn't on!")
            return;
        }

        if (args.length == 0) return false;

        // Get block
        const blockName = args[0].toLowerCase();
        const block = bot.registry.blocksByName[blockName];

        if (!block) {
            logBot("&cProvided block is incorrect!");

            for (const name in bot.registry.blocksByName) {
                if (!name.includes(blockName)) continue;

                logBot(`&cDid you mean '&4${name}&c'?`);
                return;
            }
            return;
        }

        // Find it
        let distance = 3;
        const arg2 = parseInt(args[1]);
        if (!isNaN(arg2)) distance = arg2;

        const foundBlock = bot.findBlock({
            maxDistance: distance,
            matching: block.id
        });

        if (!foundBlock) {
            logBot(`&cCouldn't find a &4${block.displayName} &cin distance of &4${distance} &cblock(s)!`);
            return;
        }


        // Open it
        await bot.openContainer(foundBlock);

        logBot(`&aOpened ${block.displayName}'s inventory!`);
        return;
    },

    /**
     * @param {import('../types.js').Main} main
     * @param {string[]} args
     */
    tabCompletion(main, args) {
        if (args.length > 2) return [];

        // First arg
        const arg1 = args[0].toLowerCase();
        if (args.length === 1) return BLOCK_CONTAINERS.filter(element => element.startsWith(arg1));


        // Second
        const arg2 = args[1].toLowerCase();
        return ["1", "2", "3", "4", "5"].filter(element => element.startsWith(arg2));
    }
}