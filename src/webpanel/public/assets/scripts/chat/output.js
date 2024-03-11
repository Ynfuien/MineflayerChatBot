import { parseMessage } from "../utils/motd-parser.js";

export { setup, showMessage, isScrollOnTheBottom, scrollToBottom };


/**
 * 
 * @param {import("../index.js").Main} main 
 */
function setup(main) {
    const { output } = main.chat;
    const { element: outputElement, scrollStepSize } = output;

    // Minecraft like scrolling
    const outputSyles = getComputedStyle(outputElement);

    const defaultWidth = parseInt(outputSyles.width.replace(/px/g, ""));
    const defaultHeight = parseInt(outputSyles.height.replace(/px/g, ""));

    const lineHeight = parseInt(getComputedStyle(outputElement.querySelector("pre")).lineHeight.replace(/px/g, ""));
    const paddingTop = defaultHeight % lineHeight;

    outputElement.addEventListener("wheel", (event) => {
        event.preventDefault();

        const padding = paddingTop / 2;

        const down = event.deltaY > 0;
        let result = outputElement.scrollTop + (scrollStepSize * (down ? 1 : -1) * lineHeight);
        result = Math.round(result / lineHeight) * lineHeight + padding;
        if (result < padding) result = padding;

        outputElement.scrollTo(outputElement.scrollLeft, result);
    });
    

    // Using interactjs for resizible output
    interact(outputElement)
        .resizable({
            margin: 5,
            edges: {
                top: true,
                right: true,
                left: false,
                bottom: false,
            },
            listeners: {
                move: function (event) {
                    const scroll = isScrollOnTheBottom(outputElement);

                    let { height, width } = event.rect;
                    if (defaultWidth - (lineHeight * 2) < width && defaultWidth + (lineHeight * 2) > width) width = defaultWidth;

                    height = (Math.round(height / lineHeight) * lineHeight) + paddingTop;
                    
                    outputElement.style.height = `${height}px`;
                    outputElement.style.width = `${width}px`;

                    if (scroll) scrollToBottom(outputElement);
                }
            }
        });
}

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
    const { element: output } = main.chat.output;

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
    return Math.abs(output.scrollHeight - output.scrollTop - output.offsetHeight) < 3;
}

/**
 * @param {HTMLDivElement} output
 */
function scrollToBottom(output) {
    output.scrollTo(output.scrollLeft, output.scrollHeight);
}