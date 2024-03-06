const { scoreboardUpdate } = require("../webpanel/webPanel.js");

module.exports = {
    name: "scoreboard_objective",
    lowLevelApi: true,
    enable: true,

    /**
     * @param {import("../index.js").Main} main
     */
    run (main, packet) {
        const { bot } = main;

        if (packet.action !== 0) return;

        const { name, displayText } = packet;
        setTimeout(() => {
            const scoreboard = bot.scoreboards[name];
            if (!scoreboard) return;

            const { ChatMessage } = main.prismarine;

            let title = displayText;
            try {
                const json = JSON.parse(displayText);
                if (typeof json === "string") {
                    title = ChatMessage.fromNotch(json);
                } else {
                    title = new ChatMessage(json);
                }
            } catch {}
            
            scoreboard.title = title;
            
            if (bot.scoreboard.sidebar !== scoreboard) return;
            scoreboardUpdate(scoreboard);
        });
    }
}