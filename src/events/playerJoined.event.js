const {logBot} = require('../utils/logger.js');

module.exports = {
    name: "playerJoined",
    enable: true,

    /**
     * @param {import("..").Main} main
     */
    run (main, player) {
        if (!main.vars.bot.logPlayers) return;

        // Check for NPCs
        if (!player.username.match(/^[a-z0-9_]{3,16}$/gi)) return;
        logBot(`&7Player &e${player.username} &ajoined &7the game!`);
    }
}