const fs = require('fs');
const { logBot } = require('../utils/logger.js');

module.exports = (main) => {
    const {bot} = main;
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
            console.logBot(chalk.redBright(`Event ${event.name} !`));

            process.exit(1);
        }
        
        if (typeof event.run !== "function") {
            logBot(`&cEvent &e${event.name}&c, run must be a function!`);
            process.exit(1);
        }

        if (event.enable === false) {
            continue;
        }

        registeredEventCount++;
        if (event.lowLevelApi === true) {
            bot._client.on(event.name, (arg1, arg2)=> {
                event.run(main, arg1, arg2);
            });

            continue;
        }

        bot.on(event.name, (arg1, arg2)=> {
            event.run(main, arg1, arg2);
        });
        
    }

    logBot(`&aRegistered &b${registeredEventCount} &aevent(s).`);
}