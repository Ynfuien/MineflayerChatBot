const { scoreboardUpdate, playerListUpdate } = require('../web-panel/web-panel.js');

module.exports = {
    name: "tape_scoreboardChange",
    enable: true,

    /**
     * @param {import('../types.js').Main} main
     * @param {import('../duck-tapes/scoreboard.tape.js').Scoreboard} scoreboard
     */
    run(main, scoreboard) {
        const { bot } = main;

        // Sidebar scoreboard update
        const { sidebar, list } = bot.duckTape.scoreboards.byPosition;
        scoreboardUpdate(sidebar);


        // Player list update
        if (!scoreboard) return;
        if (scoreboard === list) playerListUpdate();
    }
}