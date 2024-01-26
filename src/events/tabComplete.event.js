module.exports = {
    name: "tab_complete",
    lowLevelApi: true,
    enable: false,

    run (main, packet) {
        const {transactionId, matches} = packet;
        let {tabComplete} = main.commands;

        packet.matches = matches.map(match => match.match);

        if (typeof tabComplete[transactionId] === "function") {
            tabComplete[transactionId](packet);
            delete tabComplete[transactionId];
            return;
        }

        tabComplete[transactionId] = packet;

        const keys = Object.keys(tabComplete)
        if (keys.length > 20) {
            delete tabComplete[keys[0]];
        }

        main.commands.tabComplete = tabComplete;
    }
}