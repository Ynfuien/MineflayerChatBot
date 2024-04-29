import { isHidden as isTabListHidden, toggleVisibility as toggleTabListVisibility } from "../../../tab-list/tab-list.js";
import { ChatMessage } from "../../../utils/chat-message.js";
import { sendCommand } from "../../../web-socket.js";
import { suggestCommand } from "../../input/input.js";

export { setup, updateTranslations };

/**
 * @typedef {{
 *  action: "open_url" | "run_command" | "suggest_command" | "change_page" | "copy_to_clipboard",
 *  value: string
 * }} ClickEvent
 */

/** @type {import("../../../index.js").Main} */
let main;

/**
 * @param {import("../../../index.js").Main} _main 
 */
function setup(_main) {
    main = _main;

    // Mouse click event
    document.addEventListener("mousedown", (event) => {
        const { x, y } = event;

        const target = getClickEventAtCursor(x, y);
        if (!target) return;

        const clickEvent = target.getAttribute("click-event");

        let json;
        try {
            json = JSON.parse(clickEvent);
        } catch (e) {
            console.log(e);
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        performClickEvent(json);
    });


    // Open url buttons
    const { openUrl } = main;
    const openUrlElement = openUrl.element;
    const { yes, copy, no } = openUrl.buttons;

    yes.addEventListener("click", () => {
        window.open(openUrl.lastUrl, "_BLANK");
        hideOpenUrlScreen();
    });

    copy.addEventListener("click", () => {
        navigator.clipboard.writeText(openUrl.lastUrl);
        hideOpenUrlScreen();
    });

    no.addEventListener("click", () => {
        hideOpenUrlScreen();
    });


    // Open url - close with escape
    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") return;
        if (!openUrlElement.classList.contains("shown")) return;

        hideOpenUrlScreen();
    });
}

/**
 * Returns a span with a click-event, at provided x and y, or false if none found
 * @param {number} x 
 * @param {number} y 
 * @returns {false | HTMLSpanElement}
 */
function getClickEventAtCursor(x, y) {
    const { element: output } = main.chat.output;

    const elements = document.elementsFromPoint(x, y);
    let pre;
    for (const element of elements) {
        if (!(element instanceof HTMLPreElement)) continue;
        if (element.parentElement !== output) continue;

        pre = element;
        break;
    }
    if (!pre) return false;

    let clickSpan = false;
    for (const element of elements) {
        if (!(element instanceof HTMLSpanElement)) continue;
        if (element === pre) continue;
        if (!pre.contains(element)) continue;
        if (!element.hasAttribute("click-event")) continue;

        if (clickSpan && element.contains(clickSpan)) continue;
        clickSpan = element;
    }

    return clickSpan;
}


/**
 * 
 * @param {ClickEvent} clickEvent 
 */
async function performClickEvent(clickEvent) {
    const { action, value } = clickEvent;

    if (!action) return;
    if (!value) return;

    if (action === "open_url") {
        try {
            new URL(value);
        } catch { return; }

        if (value.startsWith("http://") && value.startsWith("https://")) return;

        showOpenUrlScreen(value);
        return;
    }

    if (action === "run_command") {
        sendCommand(value);
        return;
    }

    if (action === "copy_to_clipboard") {
        await navigator.clipboard.writeText(value);
        return;
    }

    if (action === "suggest_command") {
        suggestCommand(value);
        return;
    }
}

/**
 * @param {string} url 
 */
let tabList = true;
function showOpenUrlScreen(url) {
    const { openUrl } = main;
    const urlElement = openUrl.text.url;

    urlElement.textContent = url;
    openUrl.lastUrl = url;

    tabList = isTabListHidden(main);
    if (!tabList) toggleTabListVisibility(main);

    main.chat.element.classList.add("hidden");
    openUrl.element.classList.add("shown");
}

function hideOpenUrlScreen() {
    main.openUrl.element.classList.remove("shown");
    main.chat.element.classList.remove("hidden");

    if (!tabList) toggleTabListVisibility(main);
}

function updateTranslations() {
    const { text, buttons } = main.openUrl;
    const { clientLang } = main.config;

    text.info.textContent = clientLang["chat.link.confirm"];
    text.warning.textContent = clientLang["chat.link.warning"];

    buttons.yes.textContent = clientLang["gui.yes"];
    buttons.copy.textContent = clientLang["chat.copy"];
    buttons.no.textContent = clientLang["gui.no"];
}