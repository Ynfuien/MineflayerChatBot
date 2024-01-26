const {logBot} = require('../utils/logger.js');

module.exports = {
    name: "spawn",
    enable: true,

    /**
     * @param {import("..").Main} main
     */
    run (main) {
        logBot(`&bBot has been spawned!`);
    }
}