const {parseToBukkit} = require('../utils/messageParser');
const {log, logWithCustomChar} = require('../utils/logger');
const Mineflayer = require('mineflayer');
// const Registry = require('prismarine-registry')();

let last = 0;

module.exports = {
    name: "packet",
    lowLevelApi: true,
    enable: true,

    
    run(main, data, info) {
        /**
         * @type {Mineflayer.Bot}
         */
        const bot = main.bot;
        
        // return;
        // if (info.name == "multi_block_change") return;
        // if (info.name.includes("block")) return;
        // if (info.name.includes("head")) return;
        // if (info.name.includes("velocity")) return;
        // if (info.name.includes("move")) return;
        // if (info.name.includes("chunk")) return;
        // if (info.name.includes("bundle")) return;
        // if (!info.name.includes("player")) return;
        // if (info.name.includes("spawn") && info.name.includes("entity")) {
        //     if (data.entityId != 155) return;
        //     console.log(info);
        //     console.log(data);
        // }

        // if (info.name.includes("entity_move")) {
        //     if (data.entityId != 155) return;
        //     console.log(info);
        //     console.log(data);
        // }
        
        // if (data?.entityId == 282) {
        //     console.log(info);
        //     console.log(data);
        //     return;
        // }
        
        // const now = Date.now();
        // if (now - last < 2000) return;
        // last = now;
        // if (data) {
        //     const barrel = bot.registry.blocksByName["barrel"].id;
        //     for (const key of Object.keys(data)) {
        //         if (data[key] != barrel) continue;

        //         console.log(info);
        //         console.log(data);
                
        //         return;
        //     }
        // }
        
        if (info.name == "block_change") {
            const shulker = bot.registry.blocksByStateId[data.type];
            if (shulker && shulker.name.includes("shulker")) {
                console.log(info);
                console.log(data);
                console.log(shulker);
                return;
            }

            const barrel = bot.registry.blocksByName["barrel"];
            if (data.type < barrel.minStateId) return;
            if (data.type > barrel.maxStateId) return;

            console.log(info);
            console.log(data);
        }

        if (info.name == "block_action") {
            // const barrel = bot.registry.blocksByName["barrel"];
            // if (data.type < barrel.minStateId) return;
            // if (data.type > barrel.maxStateId) return;

            console.log(info);
            console.log(data);
        }

        if (info.name.includes("sound_effect")) {
            console.log(info);
            console.log(data);
        }

        // if (data?.blockId == bot.registry.blocksByName["barrel"].id) {

        //     console.log(info);
        //     console.log(data);
            
        //     return;
        // }
        // return;
        // const entity = bot.registry.entities[data.type];
        // if (data.type != 122) return;
        const string = JSON.stringify(data);
        if (!string) return;
        if (!string.includes("fc584c0e-8b91-30b6-8e6d-23660cadde0f")) return;

        console.log(info);
        console.log(data);

        // console.log(info);
        // console.log(data);

        // const block = bot.registry.blocksByStateId[data.type];
        // console.log(block);

        // console.log(data.type.toString(2));
        // console.log(data.type.toString(16));
    }
}