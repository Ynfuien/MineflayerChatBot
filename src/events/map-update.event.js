const { updateMap } = require('../web-panel/web-panel.js');

module.exports = {
    name: "map",
    lowLevelApi: true,
    enable: true,

    /**
     * @param {import('../types.js').Main} main
     * @param {import('../types.js').MapPacket} packet
     */
    run(main, packet) {
        if (packet.columns < 1) return;
        
        packet.data = Array.from(packet.data);
        updateMap(packet);
    }
}