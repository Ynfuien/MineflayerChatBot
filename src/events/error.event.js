const { logBot } = require("../utils/logger");

module.exports = {
    name: "error",
    enable: true,

    run (main, error) {
        logBot(`&cOccurred bot error: ${error}`);
        console.log(error);
    }
}