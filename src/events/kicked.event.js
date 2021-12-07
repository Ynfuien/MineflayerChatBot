const {logMotd, logBot} = require('../utils/logger.js');
const {parseToMotd} = require('../utils/messageParser.js');
const { startBot, isKeyExist } = require("../utils/YnfuTools.js");

module.exports = {
    name: "kicked",
    enable: true,

    run (main, reason) {
        reason = JSON.parse(reason);

        logMotd(`§c§lBot has been kicked from server, reason: §f${parseToMotd(reason)}`);

        if (!rejoin(main)) {
            const {config} = main;
            if (isKeyExist(config, "commands.enabled") !== true) return;
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