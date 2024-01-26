const {logBot} = require('../utils/logger.js');

module.exports = {
    name: "death",
    enable: true,

    /**
     * @param {import("..").Main} main
     */
    run (main) {
        logBot(`&cBot died!`);
    }
}