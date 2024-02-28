import { parseMessage } from "../utils/motd-parser.js";

export { showMessage, isScrollOnTheBottom, scrollToBottom };

/**
 * @param {import("../index.js").Main} main 
 * @param {{type: string, timestamp: number, message: string}} data 
 */
function showMessage(main, data, scroll = true) {
    const { output } = main.chat;

    const message = data.message;

    const pre = parseMessage(message);
    pre.classList.add("mc-text");

    const scrollDown = scroll && isScrollOnTheBottom(output);
    output.appendChild(pre);
    
    if (scrollDown) scrollToBottom(output);
}

/**
 * @param {HTMLDivElement} output
 * @returns {boolean}
 */
function isScrollOnTheBottom(output) {
    return output.scrollHeight - output.scrollTop === output.offsetHeight;
}

/**
 * @param {HTMLDivElement} output
 */
function scrollToBottom(output) {
    output.scrollTo(output.scrollLeft, output.scrollHeight);
}