import { ChatMessage } from "../utils/chat-message.js";

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

    elements.main.style.display = "";
    if (elements.main.classList.contains("hidden")) return;


    const { header, footer } = data;

    // Header
    if (lastHeader !== header) {
        elements.header.textContent = '';

        // if (header.length > 0) {
        //     // '.replaces' fix leading and trailing new lines being ignored by HTML
        //     // const headerPre = parseMessage(header.replace(/^\n/, " \n").replace(/\n$/, "\n§r "));
        //     // headerPre.classList.add("mc-text");
        //     // elements.header.appendChild(headerPre);
        //     elements.header.appendChild(header.toHTML("mc-text"));
        //     elements.header.classList.remove("empty");
        // } else {
        //     elements.header.classList.add("empty");
        // }


        elements.header.appendChild(header.toHTML("mc-text"));

        // lastHeader = header.toL;
    }

    // Footer
    if (lastFooter !== footer) {
        elements.footer.textContent = '';

        // if (footer.length > 0) {
        //     // '.replaces' fix leading and trailing new lines being ignored by HTML
        //     // const footerPre = parseMessage(footer.replace(/^\n/, " \n").replace(/\n$/, "\n§r "));
        //     // footerPre.classList.add("mc-text");
        //     // elements.footer.appendChild(footerPre);
        //     elements.footer.appendChild(footer.toHTML("mc-text"));
        //     elements.footer.classList.remove("empty");
        // } else {
        //     elements.footer.classList.add("empty");
        // }

        elements.footer.appendChild(footer.toHTML("mc-text"));

        lastFooter = footer;
    }


    // Player list
    /** @type {import("../index.js").Main.tabList.data.player[]} */
    const playersData = data.players.slice(0, 80); // 80 - max player count displayed in the tab list in vanilla
    if (!checkIfPlayerListChanged(playersData)) return;
    lastPlayers = playersData;

    list.textContent = '';

    const count = playersData.length;
    for (let i = 0; i < count; i++) {
        const player = playersData[i];

        const li = document.createElement("li");
        li.style.setProperty("--col", getColumnNumber(i + 1, count));

        // Display name
        li.appendChild(player.displayName.toHTML("mc-text"));

        const spectator = player.gamemode === 3;

        // Scoreboard value
        if (!spectator && player.score !== null) {
            const { score } = player;
            const { value, numberFormat, styling } = score;


            let displayScore = new ChatMessage({ color: "yellow", text: value });
            if (numberFormat === 0) displayScore = new ChatMessage("");
            else if (numberFormat === 1) displayScore = ChatMessage.fromLegacy(`${styling.toLegacy()}${value}`);
            else if (numberFormat === 2) displayScore = styling;

            li.appendChild(displayScore.toHTML("mc-text"));
        }

        // Ping img
        const img = document.createElement("img");
        img.src = `./assets/img/ping/${convertLatencyToPingBars(player.ping)}.png`;
        img.draggable = false;
        li.appendChild(img);

        // Spectator
        if (spectator) li.classList.add("spectator");

        list.appendChild(li);
    }
}

/**
 * 
 * @param {import('../index.js').Main.tabList.data.player[]} playersData 
 * @returns 
 */
function checkIfPlayerListChanged(playersData) {
    if (playersData.length !== lastPlayers.length) return true;

    for (let i = 0; i < playersData.length; i++) {
        const newPlayer = playersData[i];
        const oldPlayer = lastPlayers[i];

        if (newPlayer.username !== oldPlayer.username) return true;
        if (newPlayer.displayName !== oldPlayer.displayName) return true;
        if (newPlayer.ping !== oldPlayer.ping) return true;
        if (newPlayer.gamemode !== oldPlayer.gamemode) return true;
        if (newPlayer.score === null && oldPlayer.score !== null) return true;
        if (newPlayer.score) {
            if (newPlayer.score.value !== oldPlayer.score?.value) return true;
            if (newPlayer.score.numberFormat !== oldPlayer.score?.numberFormat) return true;
            if (newPlayer.score.styling !== oldPlayer.score?.styling) return true;
        }
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