import { parseMessage } from "../utils/motd-parser.js";

export { updateScoreboard };


/**
 * @param {import("../index.js").Main} main 
 */
function toggleVisibility(main) {
    const { element: scoreboard } = main.scoreboard;

    scoreboard.classList.toggle("hidden");
    if (scoreboard.classList.contains("hidden")) return;

    updateScoreboard(main);
}

/**
 * @param {import("../index.js").Main} main 
 */
function updateScoreboard(main) {
    const { scoreboard } = main;

    const { element: scoreboardElement, header, list, data } = scoreboard;
    if (scoreboardElement.classList.contains("hidden")) return;


    header.textContent = '';
    list.textContent = '';

    if (data === null) return;
    const { items, title } = data;

    // Title
    if (title) {
        const titlePre = parseMessage(title);
        titlePre.classList.add("mc-text");
        header.appendChild(titlePre);
    }

    for (const item of items) {
        const li = document.createElement("li");

        // Display name
        const displayName = parseMessage(item.displayName);
        displayName.classList.add("mc-text");
        li.appendChild(displayName);

        // Scoreboard value
        const scoreboardValue = parseMessage("§c" + item.value);
        scoreboardValue.classList.add("mc-text");

        li.appendChild(scoreboardValue);

        list.appendChild(li);
    }
}