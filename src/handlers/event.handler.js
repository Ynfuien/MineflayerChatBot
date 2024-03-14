const fs = require('fs');
const { logBot } = require('../utils/logger.js');

/**
 * @param {import('../types.js').Main} main
 */
module.exports = (main) => {
    const { bot } = main;
    const events = fs.readdirSync(__dirname + "/../events").filter(file => file.endsWith("event.js"));

    let registeredEventCount = 0;

    logBot(`&aRegistering events..`);
    for (const file of events) {
        const event = require(__dirname + `/../events/${file}`);

        if (!event.name) {
            logBot(`&cEvent missing name!`);
            process.exit(1);
        }

        if (!event.run) {
            logBot(`&cEvent &e${event.name}&c, missing run function!`);
            process.exit(1);
        }

        if (typeof event.run !== "function") {
            logBot(`&cEvent &e${event.name}&c, run must be a function!`);
            process.exit(1);
        }

        if (event.enable === false) continue;

        registeredEventCount++;
        if (event.lowLevelApi === true) {
            bot._client.on(event.name, async (arg1, arg2) => {
                try {
                    await event.run(main, arg1, arg2);
                } catch (error) {
                    logBot("&cAn error occurred while executing a low level api event!");
                    logBot(`&4Event name: &f${event.name}`);
                    logBot(`&4Error message: &f${error}`);
                    console.log(error);
                }
            });

            continue;
        }

        bot.on(event.name, async (arg1, arg2) => {
            try {
                await event.run(main, arg1, arg2);
            } catch (error) {
                logBot("&cAn error occurred while executing an event!");
                logBot(`&4Event name: &f${event.name}`);
                logBot(`&4Error message: &f${error}`);
                console.log(error);
            }
        });

    }

    logBot(`&aRegistered &b${registeredEventCount} &aevent(s).`);
}