const { logBot } = require("../utils/logger");

module.exports = {
    name: "error",
    enable: true,

    /**
     * @param {import('../types.js').Main} main
     */
    run(main, error) {
        logBot(`&cOccurred bot error: ${error}`);
    }
}