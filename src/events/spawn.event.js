const {logBot} = require('../utils/logger.js');
const Mineflayer = require('mineflayer');
// const PrismarineChat = require('prismarine-chat');
// const {Vec3} = require('vec3');

module.exports = {
    name: "spawn",
    enable: true,

    async run (main) {
        /**
         * @type {Mineflayer.Bot}
         */
        const bot = main.bot;
        logBot(`&bBot has been spawned!`);

        // console.dir(bot.registry, {depth: 1});
        
        // const ChatMessage = require('prismarine-chat')(bot.registry);
        
        // for (const line of bot.heldItem.customLore) {
        //     const chatMessage = new ChatMessage(JSON.parse(line));
        //     console.log(chatMessage.toMotd());
        // }
        // const json = {"extra":[{"text":" "},{"bold":true,"italic":false,"underlined":false,"strikethrough":false,"obfuscated":false,"color":"#FB2424","text":"Л"},{"bold":true,"italic":false,"underlined":false,"strikethrough":false,"obfuscated":false,"color":"#FC301F","text":"а"},{"bold":true,"italic":false,"underlined":false,"strikethrough":false,"obfuscated":false,"color":"#FC3B1A","text":"й"},{"bold":true,"italic":false,"underlined":false,"strikethrough":false,"obfuscated":false,"color":"#FD4715","text":"т"}],"text":""};
        // const message = new ChatMessage(json);

        // console.log(message.toString());


        // setTimeout(() => {
        //     const sugarCaneBlock = bot.registry.blocksByName["sugar_cane"];

        //     // Find sugar canes in provided distance
        //     const foundSugarCanes = bot.findBlocks({
        //         maxDistance: 5,
        //         matching: sugarCaneBlock.id,
        //         count: 20
        //     });

        //     // Get blocks above these sugar canes
        //     let blocksAbove = [];
        //     for (const vec of foundSugarCanes) {
        //         vec.y++;
        //         const blockAbove = bot.blockAt(vec);
        //         // Skip the block, if it's a sugar cane.
        //         // I guess you don't want to get sugar canes
        //         // that are above sugar canes
        //         if (blockAbove.type == sugarCaneBlock.id) continue;

        //         // Add block to the array
        //         blocksAbove.push(blockAbove);
        //         // And log it, just for fun
        //         console.log(`(${vec.x}, ${vec.y}, ${vec.z}) - ${blockAbove.displayName}`)
        //     }
        // }, 1000);
        
        // setTimeout(async () => {
        //     const position = new Vec3(-152, 91, 39);
        //     // const nextTo = bot.blockAt(new Vec3(-152, 91, 39));
        //     // console.log({nextTo});

        //     const result = await bot.lookAt(position);
        //     console.log(result);
        //     // const result = await bot.placeBlock(nextTo, new Vec3(0, 1, 0))

        //     bot.activateItem(false);
        //     bot.deactivateItem()
        // }, 200);

        // const result = await bot.placeBlock(nextTo, new Vec3(0, 1, 0))

        // for (const id in bot.registry.entities) {
        //     const entity = bot.registry.entities[id];
        //     if (entity.name.includes("player")) console.log(entity);
        // }
        // const data = {
        //     locale: "en_US",
        //     // viewDistance: 6,
        //     // chatFlags: 0,
        //     // chatColors: true,
        //     // skinParts: 0x40,
        //     // mainHand: 1,
        //     // enableTextFiltering: false,
        //     enableServerListing: false
        // };
        // bot._client.write("settings", data);
        // console.log(bot.registry.blocksByName["barrel"]);

        // setTimeout(async () => {
        //     // Find a chest
        //     const chest = bot.findBlock({
        //         maxDistance: 3,
        //         matching: bot.registry.blocksByName["barrel"].id
        //     });

        //     // Open it
        //     const window = await bot.openContainer(chest);
        //     // // const chestSlots = window.containerItems();
        //     // // Get only chest slots,
        //     // // cause window.slots contains also player's inventory
        //     // const chestSlots = window.slots.slice(0, window.inventoryStart);

        //     // // Log the items
        //     // for (const slot of chestSlots) {
        //     //     if (slot == null) continue;

        //     //     console.log(`${slot.slot}. ${slot.name} x${slot.count} - ${slot.customName ?? slot.displayName}`);
        //     // }
        // }, 200);
    }
}