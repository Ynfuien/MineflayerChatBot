const { scoreboardUpdate } = require("../webpanel/webPanel.js");


module.exports = {
    name: "teamUpdated",
    enable: true,

    /**
     * @param {import("../index.js").Main} main
     */
    run (main, team) {
        const { bot } = main;

        const { sidebar } = bot.scoreboard;
        if (!sidebar) return;

        scoreboardUpdate(sidebar);
    }
}