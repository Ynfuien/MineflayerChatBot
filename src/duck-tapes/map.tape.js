/** @type {import('../types.js').TapedBot} */
let bot;

/**
 * @typedef {MCMap} MCMap
 * @typedef {MCMapColor} MCMapColor
 * 
 * @typedef {[R: number, G: number, B: number]} Color
 */

class MCMap {
    /** @type {MCMapColor[][]} */
    data = [];


    /**
     * @param {import('../types.js').MapPacket} packet 
     */
    constructor(packet) {
        this.id = packet.itemDamage;

        this.data = new Array(128);
        for (let i = 0; i < 128; i++) {
            this.data[i] = new Array(128).fill(0);
        }

        this.update(packet);
    }

    /**
     * @param {import('../types.js').MapPacket} packet
     * @returns {boolean} Whether anything was changed
     */
    update(packet) {
        const { scale, locked, icons } = packet;

        let dataChange = false;

        if (this.scale != scale) dataChange = true;
        this.scale = scale;

        if (this.locked != locked) dataChange = true;
        this.locked = locked;

        // if (this.icons != icons) dataChange = true;
        this.icons = icons;

        if (this.#updateData(packet)) dataChange = true;

        return dataChange;
    }

    /**
     * @param {import('../types.js').MapPacket} packet 
     * @returns {boolean} Whether data was changed
     */
    #updateData(packet) {
        const { columns, rows, x, y, data } = packet;
        if (columns < 1) return false;

        let dataIndex = 0;
        for (let i = 0; i < rows; i++) {
            const row = i + y;

            for (let j = 0; j < columns; j++) {
                const column = j + x;

                const colorId = data[dataIndex];
                this.data[row][column] = new MCMapColor(colorId);

                dataIndex++;
            }
        }

        return true;
    }

    /**
     * Creates a map packet from this MCMap object
     * @returns {import('../types.js').MapPacket}
     */
    createPacket() {
        const { id, scale, locked, icons, data } = this;

        return {
            itemDamage: id,
            scale, locked, icons,
            columns: 128,
            rows: 128,
            x: 0,
            y: 0,
            data: data.map(row => row.map(column => column.id)).flat()
        };
    }
}

class MCMapColor {
    /**
     * @param {number} colorId 
     */
    constructor(colorId) {
        const color = mapColors[colorId];
        if (!color) throw new Error("There is no color with provided colorId!");

        this.id = colorId;
        this.color = color;
    }

    toHEX() {
        const { id, color } = this;
        if (id < 4) return "#00000000";

        let hex = "#";
        for (const rgb of color) hex += (rgb < 16 ? "0" : "") + rgb.toString(16);

        return hex;
    }
}


/**
 * https://minecraft.wiki/w/Map_item_format#Base_colors
 * @type {Object.<number, Color>}
 */
const baseColors = {
    0: [0, 0, 0],
    1: [127, 178, 56],
    2: [247, 233, 163],
    3: [199, 199, 199],
    4: [255, 0, 0],
    5: [160, 160, 255],
    6: [167, 167, 167],
    7: [0, 124, 0],
    8: [255, 255, 255],
    9: [164, 168, 184],
    10: [151, 109, 77],
    11: [112, 112, 112],
    12: [64, 64, 255],
    13: [143, 119, 72],
    14: [255, 252, 245],
    15: [216, 127, 51],
    16: [178, 76, 216],
    17: [102, 153, 216],
    18: [229, 229, 51],
    19: [127, 204, 25],
    20: [242, 127, 165],
    21: [76, 76, 76],
    22: [153, 153, 153],
    23: [76, 127, 153],
    24: [127, 63, 178],
    25: [51, 76, 178],
    26: [102, 76, 51],
    27: [102, 127, 51],
    28: [153, 51, 51],
    29: [25, 25, 25],
    30: [250, 238, 77],
    31: [92, 219, 213],
    32: [74, 128, 255],
    33: [0, 217, 58],
    34: [129, 86, 49],
    35: [112, 2, 0],
    36: [209, 177, 161],
    37: [159, 82, 36],
    38: [149, 87, 108],
    39: [112, 108, 138],
    40: [186, 133, 36],
    41: [103, 117, 53],
    42: [160, 77, 78],
    43: [57, 41, 35],
    44: [135, 107, 98],
    45: [87, 92, 92],
    46: [122, 73, 88],
    47: [76, 62, 92],
    48: [76, 50, 35],
    49: [76, 82, 42],
    50: [142, 60, 46],
    51: [37, 22, 16],
    52: [189, 48, 49],
    53: [148, 63, 97],
    54: [92, 25, 29],
    55: [22, 126, 134],
    56: [58, 142, 140],
    57: [86, 44, 62],
    58: [20, 180, 133],
    59: [100, 100, 100],
    60: [216, 175, 147],
    61: [127, 167, 150]
};

// https://minecraft.wiki/w/Map_item_format#Map_colors
const multiplayers = {
    0: 180,
    1: 220,
    2: 255,
    3: 135
}

/**
 * @type {Object.<number, Color>}
 */
let mapColors = {};
for (const id in baseColors) {
    const color = baseColors[id];

    for (const number in multiplayers) {
        const multiplayer = multiplayers[number];
        const resultId = (parseInt(id) * 4) + parseInt(number);
        mapColors[resultId] = multiplyColor(color, multiplayer);
    }
}

function multiplyColor(color, multiplayer) {
    const r = color[0];
    const g = color[1];
    const b = color[2];

    return [
        Math.floor(r * multiplayer / 255),
        Math.floor(g * multiplayer / 255),
        Math.floor(b * multiplayer / 255)
    ]
}


module.exports = {
    name: "map",
    enabled: true,

    /**
     * @param {import('../types.js').TapedBot} _bot
     */
    load(_bot) {
        bot = _bot;

        /** @type {import('../types.js').TapedMaps} */
        const maps = {
            list: [],
            byId: {}
        };

        if (!bot.duckTape) bot.duckTape = {};
        bot.duckTape.maps = maps;


        bot._client.on("map", /** @param {import('../types.js').MapPacket} packet */(packet) => {
            const { itemDamage: id } = packet;

            if (maps.byId[id]) {
                const map = maps.byId[id];
                const dataChanged = map.update(packet);

                bot.emit("tape_mapUpdate", map, dataChanged);
                return;
            }

            const map = new MCMap(packet);
            maps.byId[id] = map;
            maps.list.push(map);

            bot.emit("tape_mapUpdate", map, true);
        });


        bot.on("login", () => {
            maps.list = [];
            for (const id in maps.byId) delete maps.byId[id];
        });

    },
    MCMap,
    MCMapColor,
    mapColors
};