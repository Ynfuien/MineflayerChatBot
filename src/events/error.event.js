const { logBot } = require("../utils/logger");

module.exports = {
    name: "error",
    enable: true,

    /**
     * @param {import("..").Main} main
     */
    run (main, error) {
        logBot(`&cOccurred bot error: ${error}`);
    }
}