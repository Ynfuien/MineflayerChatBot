const fs = require('fs');
const { logBot } = require('../utils/logger.js');

/**
 * @param {import('../types.js').Main} main
 */
module.exports = async (main) => {
    const { bot } = main;
    const duckTapesPath = `${__dirname}/../duck-tapes`;
    const tapes = fs.readdirSync(duckTapesPath).filter(file => file.endsWith("tape.js"));

    let tapesCount = 0;

    logBot(`&9Setting up duck tapes..`);
    for (const file of tapes) {
        const tape = require(`${duckTapesPath}/${file}`);

        if (!tape.name) {
            logBot(`&cTape is missing name!`);
            continue;
        }

        if (!tape.load) {
            logBot(`&cTape &e${tape.name}&c is missing a load function!`);
            continue;
        }

        if (typeof tape.load !== "function") {
            logBot(`&cTape &e${tape.name}&c - load must be a function!`);
            continue;
        }

        if (tape.enabled !== true) continue;

        tapesCount++;

        try {
            await tape.load(bot);
        } catch (error) {
            logBot("&cAn error occurred while loading a duck tape!");
            logBot(`&4Tape: &f${tape.name}`);
            logBot(`&4Error message: &f${error}`);
            console.log(error);
        }
    }

    logBot(`&b${tapesCount} &9duck tape(s) set up.`);
}