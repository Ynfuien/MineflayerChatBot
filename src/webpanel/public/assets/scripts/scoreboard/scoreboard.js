import { parseMessage } from "../utils/motd-parser.js";

export { updateScoreboard, toggleVisibility };


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
    const { displayText, numberFormat, styling } = data;

    // Title
    if (displayText) {
        const titlePre = parseMessage(displayText);
        titlePre.classList.add("mc-text");
        header.appendChild(titlePre);
    }

    const items = data.items.slice(0, scoreboard.limit);
    for (const item of items) {
        const li = document.createElement("li");

        // Display name
        const displayName = parseMessage(item.displayName);
        displayName.classList.add("mc-text");
        li.appendChild(displayName);

        const valueFormat = item.numberFormat ?? numberFormat;
        const valueStyling = item.styling ?? styling;

        // Value
        let displayValue = `§c${item.value}`;
        if (valueFormat === 0) displayValue = "";
        else if (valueFormat === 1) displayValue = `${valueStyling}${item.value}`;
        else if (valueFormat === 2) displayValue = valueStyling;

        if (displayValue.length > 0) {
            const scoreboardValue = parseMessage(displayValue);
            scoreboardValue.classList.add("mc-text");
    
            li.appendChild(scoreboardValue);
        }

        list.appendChild(li);
    }
}