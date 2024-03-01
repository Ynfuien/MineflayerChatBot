import { parseMessage } from "../utils/motd-parser.js";

export { showActionBar };


/**
 * 
 * @param {import("../index.js").Main} main 
 */
function showActionBar(main, message) {
    const { actionBar } = main.chat;

    const pre = parseMessage(message);
    pre.classList.add("mc-text");

    actionBar.textContent = '';
    actionBar.appendChild(pre);

    actionBar.classList.remove("hidden");
    setTimeout(() => {
        actionBar.classList.add("hidden");
    }, 10);
}