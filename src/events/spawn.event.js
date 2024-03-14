const { logBot } = require('../utils/logger.js');

module.exports = {
    name: "spawn",
    enable: true,

    /**
     * @param {import('../types.js').Main} main
     */
    run() {
        logBot(`&bBot has been spawned!`);
    }
}