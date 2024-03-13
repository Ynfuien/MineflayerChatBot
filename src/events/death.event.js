const {logBot} = require('../utils/logger.js');

module.exports = {
    name: "death",
    enable: true,

    /**
     * @param {import('../types.js').Main} main
     */
    run () {
        logBot(`&cBot died!`);
    }
}