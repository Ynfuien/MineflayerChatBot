import { ChatMessage } from "../../utils/chat-message.js";

export { showActionBar };


/**
 * 
 * @param {import("../../index.js").Main} main
 * @param {ChatMessage} message
 */
function showActionBar(main, message) {
    const { actionBar } = main.chat;

    actionBar.textContent = '';
    actionBar.appendChild(message.toHTML("mc-text"));

    actionBar.classList.remove("hidden");
    setTimeout(() => {
        actionBar.classList.add("hidden");
    }, 10);
}