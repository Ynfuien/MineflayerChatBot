import { ChatMessage } from "../utils/chat-message.js";

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

    header.style.display = "none";
    list.style.display = "none";

    if (data === null) return;
    const { displayText, numberFormat, styling } = data;

    // Title
    if (displayText) {
        header.appendChild(displayText.toHTML("mc-text"));
        header.style.display = "";
    }

    // Items
    const items = data.items.slice(0, scoreboard.limit);
    for (const item of items) {
        const li = document.createElement("li");

        // Display name
        const displayName = item.displayName.toHTML("mc-text");
        if (displayName.innerText.length === 0) displayName.innerText = " ";
        li.appendChild(displayName);

        // Score
        const valueFormat = item.numberFormat ?? numberFormat;
        const valueStyling = item.styling ?? styling;

        let displayScore = new ChatMessage({color: "red", text: item.value});
        if (valueFormat === 0) displayScore = new ChatMessage("");
        else if (valueFormat === 1) displayScore = ChatMessage.fromLegacy(`${valueStyling.toLegacy()}${value}`);
        else if (valueFormat === 2) displayScore = valueStyling;

        const html = displayScore.toHTML("mc-text");
        if (html.innerText.length > 0) li.appendChild(html);

        list.appendChild(li);
    }

    if (items.length > 0) list.style.display = "";
}