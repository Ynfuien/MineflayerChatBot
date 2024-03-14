module.exports = {
    name: "tab_complete",
    lowLevelApi: true,
    enable: true,

    /**
     * @param {import('../types.js').Main} main
     */
    run(main, packet) {
        main.commands.tabComplete.lastPacket = packet;
    }
}