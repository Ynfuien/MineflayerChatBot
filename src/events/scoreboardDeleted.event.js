const { scoreboardUpdate } = require('../webpanel/webPanel.js');

module.exports = {
    name: "scoreboardDeleted",
    enable: true,

    /**
     * @param {import("../index.js").Main} main
     * @param {{name: string, title: string, itemsMap: Object.<string, {name: string, value: number, displayName: any}>}} scoreboard
     */
    run (main, scoreboard) {
        const { bot } = main;

        const { sidebar } = bot.scoreboard;
        if (!sidebar) return;
        if (scoreboard.name !== sidebar.name) return;

        scoreboardUpdate(null);
    }
}