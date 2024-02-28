import { parseMessage } from "../utils/motd-parser.js";

export { showMessage, isScrollOnTheBottom, scrollToBottom };

/**
 * @typedef {{
 *      type: string,
 *      timestamp: number,
 *      message: string
 * }} MessageData
 */

/**
 * @param {import("../index.js").Main} main 
 * @param {MessageData} data 
 */
function showMessage(main, data, scroll = true) {
    const { chatPatterns } = main.config;
    const { output } = main.chat;

    let { type } = data;
    if (type === 0) type = "bot";
    else if (type === 1) type = "minecraft";
    
    const pattern = chatPatterns[type];
    const message = formatMessage(data, pattern);

    const pre = parseMessage(message);
    pre.classList.add("mc-text");

    const scrollDown = scroll && isScrollOnTheBottom(output);
    output.appendChild(pre);
    
    if (scrollDown) scrollToBottom(output);
}

/**
 * 
 * @param {MessageData} message
 * @param {string} pattern
 * @returns {string}
 */
function formatMessage(data, pattern) {
    const { message, timestamp } = data;

    pattern = pattern.replace(/&/g, "§");
    pattern = formatDate(pattern, timestamp);
    return pattern.replace(/\{message\}/g, message);
}

/**
 * 
 * @param {string} pattern 
 * @param {number} timestamp 
 * @returns {string}
 */
function formatDate(pattern, timestamp) {
    const date = new Date(timestamp);

    const props = {
        years: date.getFullYear(),
        months: date.getMonth() + 1,
        days: date.getDate(),
        hours: date.getHours(),
        minutes: date.getMinutes(),
        seconds: date.getMinutes()
    };
    
    for (const key in props) {
        if (!pattern.includes(key)) continue;

        let value = props[key];
        if (value < 10) value = `0${value}`;

        pattern = pattern.replace(new RegExp(`\{${key}\}`, "g"), value);
    }

    return pattern;
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