const {logBot} = require('../utils/logger.js');

module.exports = {
    name: "playerJoined",
    enable: false,

    run (main, player) {
        const {onServer} = main.temp.bot;
        if (!onServer) return;

        if (!player.username.match(/^[a-z0-9_]{3,16}$/gi)) return;
        logBot(`&7Player &e${player.username} &ajoined &7the game!`);
    }
}