const PrismarineChat = require('prismarine-chat');

const { packetToChatMessage } = require('../utils/messageUtils.js');
const { Team } = require('mineflayer');


/** @type {import('../types.js').TapedBot} */
let bot = null;
/** @type {PrismarineChat.ChatMessage} */
let ChatMessage = null;

/**
 * @typedef {Scoreboard} Scoreboard
 * @typedef {ScoreboardItem} ScoreboardItem
 */


class Scoreboard {
    /** @type {string} */
    name;
    /** @type {PrismarineChat.ChatMessage} */
    displayText;
    /** @type {0 | 1} */
    type;
    /** @type {null | 0 | 1 | 2} */
    numberFormat;
    /** @type {null | PrismarineChat.ChatMessage} */
    styling;

    /** @type {Object.<string, ScoreboardItem>} */
    items = {};


    /**
     * @param {import('../types.js').ScoreboardObjectivePacket} packet 
     */
    constructor(packet) {
        this.name = packet.name;
        this.modifyData(packet);
    }

    /**
     * @param {import('../types.js').ScoreboardObjectivePacket} packet 
     */
    modifyData(packet) {
        this.setDisplayText(packet.displayText);
        this.setType(packet.type);
        this.setNumberFormat(packet.number_format);
        this.setStyling(packet.styling);
    }

    setDisplayText(displayText) {
        if (typeof displayText === "string") {
            try {
                const json = JSON.parse(displayText);
                if (typeof json === "string") {
                    this.displayText = ChatMessage.fromNotch(json);
                    return;
                }
                if (json.text && Object.keys(json).length === 1) {
                    this.displayText = ChatMessage.fromNotch(json.text);
                    return;
                }
            } catch {}
        }

        this.displayText = packetToChatMessage(bot, displayText);
    }

    setType(type) {
        this.type = type;
    }

    setNumberFormat(numberFormat) {
        if (numberFormat === undefined) return this.numberFormat = null;

        this.numberFormat = numberFormat;
    }

    setStyling(styling) {
        if (styling === undefined) return this.styling = null;

        this.styling = packetToChatMessage(bot, styling);
    }

    /**
     * @param {import('../types.js').ScoreboardScorePacket} packet 
     */
    updateScore(packet) {
        const { itemName } = packet;
        this.items[itemName] = new ScoreboardItem(packet);
    }

    removeScore(itemName) {
        delete this.items[itemName];
    }

    /**
     * Returns named representations of 'numberFormat' value.
     * "none" means that feature isn't supported (<1.20.3)
     * @returns {"blank" | "styled" | "fixed" | "none"}
     */
    getNumberFormat() {
        switch (this.numberFormat) {
            case 0:
                return "blank";
            case 1:
                return "styled";
            case 2:
                return "fixed";
            default:
                return "none";
        }
    }

    /**
     * Returns named representations of 'type' value.
     * @returns {"hearts" | "integer"}
     */
    getType() {
        return this.type === 1 ? "hearts" : "integer";
    }

    /**
     * Returns items in a sorted array
     * @returns {ScoreboardItem[]}
     */
    getItemArray() {
        const items = Object.values(this.items);

        items.sort((a, b) => {
            if (a.value < b.value) return 1;
            else if (a.value > b.value) return -1;

            const an = a.name.toLowerCase();
            const bn = b.name.toLowerCase();

            if (an < bn) return -1;
            else if (an > bn) return 1;

            return 0;
        });

        return items;
    }
}

class ScoreboardItem {
    /** @type {string} */
    name;
    /** @type {number} */
    value;
    /** @type {null | PrismarineChat.ChatMessage} */
    displayName;
    /** @type {null | 0 | 1 | 2} */
    numberFormat;
    /** @type {null | PrismarineChat.ChatMessage} */
    styling;

    /** @type {null | Team} */
    team;
    
    /**
     * @param {import('../types.js').ScoreboardScorePacket} packet 
     */
    constructor (packet) {
        const { itemName, value, display_name, number_format, styling } = packet;

        this.name = itemName;
        this.value = value;
        this.displayName = display_name ? packetToChatMessage(bot, display_name) : null;
        this.numberFormat = number_format !== undefined ? number_format : null;
        this.styling = styling ? packetToChatMessage(bot, styling) : null;
    }

    /**
     * @param {null | Team} team 
     */
    setTeam(team) {
        this.team = team;
    }

    getFinalDisplayText() {
        const { team, displayName, name } = this;

        // if (name === "Ynfuien") console.log(this);
        if (displayName) return displayName;
        if (team) return team.displayName(name);

        return ChatMessage.fromNotch(name);
    }
}


module.exports = {
    /**
     * @param {import('../types.js').TapedBot} _bot 
     */
    load(_bot) {
        bot = _bot;
        ChatMessage = PrismarineChat(bot.registry);

        /** @type {import('../types.js').TapedScoreboards} */
        const scoreboards = {
            list: [],
            byName: {},
            byPosition: {
                list: null,
                sidebar: null,
                belowName: null
            }
        };
        
        for (let i = 3; i <= 18; i++) scoreboards.byPosition[i] = null;

        if (!bot.duckTape) bot.duckTape = {};
        bot.duckTape.scoreboards = scoreboards;


        // Create, delete and modify scoreboard
        bot._client.on("scoreboard_objective", /** @param {import('../types.js').ScoreboardObjectivePacket} packet */ (packet) => {
            const { name, action } = packet;
            
            // Create scoreboard
            if (action === 0) {
                const scoreboard = new Scoreboard(packet);
                scoreboards.byName[name] = scoreboard;
                scoreboards.list.push(scoreboard);

                bot.emit("tape_scoreboardChange", scoreboard);
                bot.emit("tape_scoreboardCreated", scoreboard);
                return;
            }

            // Delete scoreboard
            if (action === 1) {
                const scoreboard = scoreboards.byName[name];
                if (!scoreboard) return;

                const index = scoreboards.list.indexOf(scoreboard);
                scoreboards.list.splice(index, 1);

                for (const position in scoreboards.byPosition) {
                    const sb = scoreboards.byPosition[position];
                    if (sb === scoreboard) scoreboards.byPosition[position] = null;
                }

                delete scoreboards.byName[name];

                bot.emit("tape_scoreboardChange", null);
                bot.emit("tape_scoreboardDeleted", scoreboard);
                return;
            }

            // Modify scoreboard
            if (action === 2) {
                const scoreboard = scoreboards.byName[name];
                if (!scoreboard) return;

                scoreboard.modifyData(packet);
                bot.emit("tape_scoreboardChange", scoreboard);
                bot.emit("tape_scoreboardModified", scoreboard);
                return;
            }
        });


        // Set scoreboard position
        bot._client.on("scoreboard_display_objective", /** @param {import('../types.js').ScoreboardDisplayObjectivePacket} packet */ (packet) => {
            const { name, position } = packet;

            console.log(packet);
            // Clear the position
            if (name === "") {
                setPosition(position, null);
                bot.emit("tape_scoreboardChange", null);
                bot.emit("tape_scoreboardPositioned", null, position);
                return;
            }

            const scoreboard = scoreboards.byName[name];
            if (!scoreboard) return;

            // Set a scoreboard to the position
            setPosition(position, scoreboard);
            // console.dir(scoreboards.byPosition, {depth: 1});

            bot.emit("tape_scoreboardChange", scoreboard);
            bot.emit("tape_scoreboardPositioned", scoreboard, position);
        });
        

        // Set score or remove it
        bot._client.on("scoreboard_score", /** @param {import('../types.js').ScoreboardScorePacket} packet */ (packet) => {
            const { itemName, action, scoreName } = packet;

            const scoreboard = scoreboards.byName[scoreName];
            if (!scoreboard) return;

            if (action === 1) {
                const score = scoreboard.items[itemName];
                if (!score) return;

                scoreboard.removeScore(itemName);
                bot.emit("tape_scoreboardChange", scoreboard);
                bot.emit("tape_scoreboardScoreReset", scoreboard, score);
                return;
            }

            scoreboard.updateScore(packet);
            bot.emit("tape_scoreboardChange", scoreboard);
            bot.emit("tape_scoreboardScoreUpdated", scoreboard, scoreboard.items[itemName]);
        });


        // Remove score
        bot._client.on("reset_score", /** @param {import('../types.js').ResetScorePacket} packet */ (packet) => {
            const { entity_name, objective_name } = packet;

            if (objective_name) {
                const scoreboard = scoreboards.byName[objective_name];
                if (!scoreboard) return;

                const score = scoreboard.items[entity_name];
                if (!score) return;

                scoreboard.removeScore(entity_name);
                bot.emit("tape_scoreboardChange", scoreboard);
                bot.emit("tape_scoreboardScoreReset", scoreboard, score);
                return;
            }

            for (const scoreboard of scoreboards.list) {
                const score = scoreboard.items[entity_name];
                if (!score) continue;

                scoreboard.removeScore(entity_name);
                bot.emit("tape_scoreboardScoreReset", scoreboard, score);
            }
            bot.emit("tape_scoreboardChange", null);
        });

        bot._client.on("teams", (packet) => {
            // if (packet.team !== "zwykly") console.log(packet);
            setTimeout(() => {
                const { teamMap } = bot;

                for (const scoreboard of scoreboards.list) {
                    for (const score of scoreboard.getItemArray()) {
                        const team = teamMap[score.name];
                        score.setTeam(team ? team : null);
                    }
                }

                bot.emit("tape_scoreboardChange", null);
            });
        });

        /**
         * @param {number} position 
         * @param {Scoreboard | null} scoreboard 
         */
        function setPosition(position, scoreboard) {
            scoreboards.byPosition[position] = scoreboard;
            if (position < 3) scoreboards.byPosition[getNamedPosition(position)] = scoreboard;
        }
    },
    Scoreboard,
    ScoreboardItem
};

/**
 * Returns named representation of a position number.
 * @param {number} position
 * @returns {"list" | "sidebar" | "belowName" | "none"}
 */
function getNamedPosition(position) {
    switch (position) {
        case 0:
            return "list";
        case 1:
            return "sidebar";
        case 2:
            return "belowName";
        default:
            return "none";
    }
}