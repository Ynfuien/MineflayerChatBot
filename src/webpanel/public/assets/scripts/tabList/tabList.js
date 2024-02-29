import { parseMessage } from "../utils/motd-parser.js";

export { updateTabList, toggleVisibility };

let lastHeader = "";
let lastFooter = "";
/** @type {import("../index.js").Main.tabList.data.player[]} */
let lastPlayers = [];

/**
 * @param {import("../index.js").Main} main 
 */
function toggleVisibility(main) {
    const { main: tabList } = main.tabList.elements;

    tabList.classList.toggle("hidden");
    if (tabList.classList.contains("hidden")) return;

    updateTabList(main);
}

/**
 * @param {import("../index.js").Main} main 
 */
function updateTabList(main) {
    const tabList = main.tabList;

    const { data, elements } = tabList;
    const { list } = elements;

    if (elements.main.classList.contains("hidden")) return;

    // Header
    if (lastHeader !== data.header) {
        elements.header.innerHTML = '';
    
        const headerPre = parseMessage(data.header);
        headerPre.classList.add("mc-text");
        elements.header.appendChild(headerPre);

        lastHeader = data.header;
    }
    
    // Footer
    if (lastFooter !== data.footer) {
        elements.footer.innerHTML = '';
    
        const footerPre = parseMessage(data.footer);
        footerPre.classList.add("mc-text");
        elements.footer.appendChild(footerPre);

        lastFooter = data.footer;
    }


    // Player list
    /** @type {import("../index.js").Main.tabList.data.player[]} */
    const playersData = data.players.slice(0, 80); // 80 - max player count displayed in the tab list in vanilla
    if (!checkIfPlayerListChanged(playersData)) return;
    lastPlayers = playersData;

    list.innerHTML = '';

    const count = playersData.length;
    for (let i = 0; i < count; i++) {
        const player = playersData[i];

        const li = document.createElement("li");
        li.style.setProperty("--col", getColumnNumber(i + 1, count));

        // Display name
        const displayName = parseMessage(player.displayName);
        displayName.classList.add("mc-text");
        li.appendChild(displayName);

        // Scoreboard value
        if (player.scoreboardValue !== null) {
            const scoreboardValue = parseMessage("§e" + player.scoreboardValue);
            scoreboardValue.classList.add("mc-text");

            li.appendChild(scoreboardValue);
        }

        // Ping img
        const img = document.createElement("img");
        img.src = `./assets/img/ping/${convertLatencyToPingBars(player.ping)}.png`;
        img.draggable = false;
        li.appendChild(img);

        // Spectator
        if (player.gamemode === 3) li.classList.add("spectator");

        list.appendChild(li);
    }
}

function checkIfPlayerListChanged(playersData) {
    if (playersData.length !== lastPlayers.length) return true; 

    for (let i = 0; i < playersData.length; i++) {
        const newPlayer = playersData[i];
        const oldPlayer = lastPlayers[i];

        if (newPlayer.username !== oldPlayer.username) return true;
        if (newPlayer.displayName !== oldPlayer.displayName) return true;
        if (newPlayer.ping !== oldPlayer.ping) return true;
        if (newPlayer.gamemode !== oldPlayer.gamemode) return true;
        if (newPlayer.scoreboardValue !== oldPlayer.scoreboardValue) return true;
    }

    return false;
}

function getColumnNumber(number, count) {
    let columns = count / 20;
    if (columns % 1 !== 0) columns = parseInt(++columns);

    const playersPerColumn = Math.ceil(count / columns);

    let columnNumber = number / playersPerColumn;
    if (columnNumber % 1 !== 0) columnNumber = parseInt(++columnNumber);

    return columnNumber;
}

function convertLatencyToPingBars(latency) {
    if (latency < 150) return 5;
    if (latency < 300) return 4;
    if (latency < 600) return 3;
    if (latency < 1000) return 2;

    return 1;
}