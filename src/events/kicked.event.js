const {logMotd, logBot} = require('../utils/logger.js');
const { startBot, doesKeyExist } = require("../utils/YnfuTools.js");

module.exports = {
    name: "kicked",
    enable: false,

    run (main, reason) {
        reason = JSON.parse(reason);

        logMotd(`§c§lBot has been kicked from server, reason: §f${reason}`);

        if (!rejoin(main)) {
            const {config} = main;
            if (doesKeyExist(config, "commands.enabled") !== true) return;
            const prefix = config.commands.prefix;
            if (!prefix) return;
            logBot(`&bIf you want to rejoin type &3${prefix}bot start`);
        }
    }
}

function rejoin(main) {
    const {autoRejoin} = main.temp.config;
    if (!autoRejoin) return;
    if (autoRejoin.enabled !== true) return;
    return true;
}