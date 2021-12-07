export {getDateAndTime, insertTextInString, spliceString, moveWindowSelection, appendChatMessage};
import {parseMessage} from './YnfuMotdParser.js';

function insertTextInString(string, text, index) {
    if (typeof string !== "string") return null;
    if (typeof text !== "string") return null;
    if (typeof index !== "number" && typeof index !== "bigint") return null;
    return string.substring(0, index) + text + string.substr(index);
}

function spliceString(string, from, to) {
    if (typeof string !== "string") return null;
    if (typeof from !== "number" && typeof from !== "bigint") return null;
    if (typeof to !== "number" && typeof to !== "bigint") return null;
    return string.substring(0, from) + string.substr(to);
}

function moveWindowSelection(count, direction = "right", type = "character") {
    const selection = window.getSelection();
    for (let i = 0; i < count; i++) {
        selection.modify("move", direction, type);
    }
}

function getDateAndTime(timestamp) {
    if (!timestamp) timestamp = Date.now();
    let d = new Date(timestamp);

    // let date = `${d.getFullYear()}.${addLeadingZero(d.getMonth() + 1)}.${addLeadingZero(d.getDate())}`;
    let date = `${addLeadingZero(d.getMonth() + 1)}.${addLeadingZero(d.getDate())}`;
    let time = `${addLeadingZero(d.getHours())}:${addLeadingZero(d.getMinutes())}:${addLeadingZero(d.getSeconds())}`;
    
    let dateTime = `${date} ${time}`;

    return dateTime;
}

function addLeadingZero(number) {
    if (number < 10) return `0${number}`;

    return number;
}

function appendChatMessage(main, message, timestamp) {
    if (!main) return null;
    const {output} = main.chat;

    // if (!(output instanceof HTMLElement)) return;
    // const {scrollHeight, scrollTop, offsetHeight} = output;

    let scrollDown = false;
    if (scrollHeight - scrollTop === offsetHeight) scrollDown = true;

    // if (!timestamp) timestamp = Date.now();
    let msg = `§#bdbdbd[${getDateAndTime(timestamp)}] §f${message}`;
    output.appendChild(parseMessage(msg));

    if (scrollDown) output.scrollTo(output.scrollLeft, output.scrollHeight);
    output.scrollTo(output.scrollLeft, output.scrollHeight);
}