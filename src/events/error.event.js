const { logBot } = require("../utils/logger");

module.exports = {
    name: "error",
    enable: true,

    run (main, error) {
        console.log(error);
        logBot(`&cOccurred bot error: ${error}`);
    }
}