const {logBot} = require('../utils/logger.js');

module.exports = {
    name: "spawn",
    enable: true,

    run (main) {
        const {bot} = main;
        logBot(`&bBot has been spawned!`);
    }
}