// const { tabComplete } = require("../handlers/tabcomplete.handler.js");
const { writeBotTabCompletionPacket } = require("../utils/YnfuTools.js");
const { logBot } = require("../utils/logger.js");
const { playerListUpdate } = require("../webpanel/webPanel.js");

module.exports = {
    name: "test",
    enable: true,
    aliases: ["t"],

    /**
     * @param {import("..").Main} main
     * @param {string[]} args
     */
    async run (main, args) {
        const {bot} = main;
        

        bot.tabComplete("heal ");
        // console.dir(bot.scoreboard, {depth: 5});
        // const listScoreboard = bot.scoreboard;
        // console.dir(listScoreboard, {depth: 10});
        // for (let i = 0; i < 3; i++) {
        //     const player = Object.values(bot.players)[i];
        //     console.log(player.displayName.toMotd());
        //     console.log(player.displayName.toAnsi());
        // }
        // console.log(bot.players["-Wzium"]);

        // console.log(bot.heldItem.nbt);
        // return;
        // for (let i = 0; i < 10; i++) {
        //     const username = makeid(randomInt(3, 16));
        //     setTimeout(() => {
        //         bot.chat(`/doll create ${username}`);
        //         setTimeout(() => {
        //             bot.chat(`/doll spawn ${username}`);
        //         }, i * 500);
        //     }, i * 500);
        // }
        // console.log(bot.tablist.header.toAnsi());
        // console.log(bot.tablist.footer.toAnsi());
        // const cmd = args.join(" ");
        
        // const result = getSortedPlayerList(bot);

        // await playerListUpdate(main);

        // const {ChatMessage} = main.prismarine;

        // const msg = ChatMessage.fromNotch("§bTest §celo §btest §clo2 §bte2 §clo3 §bte3");
        // console.dir(msg.json, {depth: 10});
        // console.log(result);
        // console.log(bot.teamMap);-t
        
        // console.log(bot.teamMap.Ynfuien);
        
        // const maches = await bot.tabComplete(cmd, false, true);
        // // const maches = await tabComplete(main, cmd);
        // console.log(maches);


        // const completionPromise = bot.tabComplete(cmd);
        // const timeoutPromise = new Promise(resolve => setTimeout(resolve, 50));

        // const resultPromise = await Promise.race([comple-tionPromise, timeoutPromise])
        
        // const maches = !resultPromise ? [] : resultPromise;
        // console.log(maches);

        // writeBotTabCompletionPacket(bot, cmd, getTrans());
        // console.log(new Date().getTime());
        return true;


        /// -t g123456789012345678901234567890123456789012345678901234567890123
    },

    /**
     * @param {import("..").Main} main
     * @param {string[]} args
     */
    tabCompletion(main, args) {
        return [];
    }
}



function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

function randomInt(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}