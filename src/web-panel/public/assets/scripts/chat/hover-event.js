import { ChatMessage } from "../utils/chat-message.js";


export { setup };

/** @type {import("../index.js").Main} */
let main;

let rootFontSize = 16;

/**
 * @param {import("../index.js").Main} _main 
 */
function setup(_main) {
    main = _main;

    const { output, hover } = main.chat;
    const { frame } = hover;

    const documentStyles = getComputedStyle(document.documentElement);
    rootFontSize = documentStyles.fontSize; // returns string with 'px'
    rootFontSize = parseInt(rootFontSize.substring(0, rootFontSize.length - 2));

    let lastHoverEvent = null;
    document.addEventListener("mousemove", (event) => {
        const { x, y } = event;

        const target = getHoverEventAtCursor(x, y);
        if (!target) {
            hide();
            return;
        }

        // Hover event already parsed
        if (target === lastHoverEvent) {
            updatePosition(x, y);
            show();
            return;
        }
        lastHoverEvent = target;

        frame.textContent = '';

        const json = target.getAttribute("hover-event");
        const parsed = JSON.parse(json);

        const messages = getFinalMessages(parsed);
        if (messages.length === 0) return;

        for (const message of messages) frame.appendChild(message.toHTML("mc-text"));

        updatePosition(x, y);
        show();
    });
}

/**
 * Returns a span with a hover-event, at provided x and y, or false if none found
 * @param {number} x 
 * @param {number} y 
 * @returns {false | HTMLSpanElement}
 */
function getHoverEventAtCursor(x, y) {
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

    let hoverSpan = false;
    for (const element of elements) {
        if (!(element instanceof HTMLSpanElement)) continue;
        if (element === pre) continue;
        if (!pre.contains(element)) continue;
        if (!element.hasAttribute("hover-event")) continue;

        if (hoverSpan && element.contains(hoverSpan)) continue;
        hoverSpan = element;
    }

    return hoverSpan;
}

/**
 * Parses hover event contents into ChatMessages
 * @param {import("../utils/chat-message.js").HoverEvent} hoverEvent
 * @returns {ChatMessage[]}
 */
function getFinalMessages(hoverEvent) {
    const messages = [];
    const { config } = main;

    // Show text - mostly custom hover messages
    if (hoverEvent.action === "show_text") {
        // Spliting the message every new line,
        // because I need them seperate in the DOM
        const legacy = new ChatMessage(hoverEvent.contents).toLegacy();
        const lines = legacy.split("\n");

        let prevLineStyle = new ChatMessage();
        for (const line of lines) {
            const message = ChatMessage.fromLegacy(line);
            if (!message.color) {
                for (const key in prevLineStyle) message[key] = prevLineStyle[key];
            }

            messages.push(message);
            prevLineStyle = message.getTheLastStyle();
        }

        return messages;
    }

    // Show entity - mainly used in command responses by vanilla
    if (hoverEvent.action === "show_entity") {
        const { name, type, id } = hoverEvent.contents;
        if (!name || !type || !id) return messages;

        const translatedType = config.clientLang[`entity.${type.replace(":", ".")}`];

        messages.push(
            new ChatMessage(name),
            new ChatMessage(`Type: ${translatedType}`),
            new ChatMessage(id)
        );

        return messages;
    }

    // Show item - also mostly custom, didn't see it in the vanilla chat,
    // looks the same as hover in the inventory
    if (hoverEvent.action === "show_item") {
        const { id, tag } = hoverEvent.contents;
        if (!id) return;

        const translateId = id.replace(":", ".");
        let displayName = config.clientLang[`item.${translateId}`] || config.clientLang[`block.${translateId}`];
        if (!displayName) return;

        let displayNameMsg = new ChatMessage(displayName);
        let loreMsg = [];
        const idMsg = new ChatMessage({ color: "dark_gray", text: id });
        let nbtMsg = null;


        if (tag) {
            const nbt = JSON.parse(tag);

            const count = Object.keys(nbt).length;
            if (count > 0) nbtMsg = new ChatMessage({ color: "dark_gray", text: `NBT: ${count} tag(s)` });

            const { display } = nbt;
            if (display) {
                const { Name, Lore } = display;

                if (Name) displayNameMsg = new ChatMessage(Name);
                if (Lore) {
                    for (const line of Lore) {
                        const lineMsg = new ChatMessage(line);

                        if (!lineMsg.color) lineMsg.color = "dark_purple";
                        if (!("italic" in lineMsg)) lineMsg.italic = true;
                        loreMsg.push(lineMsg);
                    }
                }
            }
        }


        messages.push(displayNameMsg, ...loreMsg, idMsg);
        if (nbtMsg) messages.push(nbtMsg);

        return messages;
    }

    return messages;
}

function show() {
    const { element } = main.chat.hover;
    element.classList.add("shown");
}

function hide() {
    const { element } = main.chat.hover;
    element.classList.remove("shown");
}

function isShown() {
    const { element } = main.chat.hover;
    return element.classList.contains("shown");
}

/**
 * Updates hover element position
 * @param {number} x 
 * @param {number} y 
 */
function updatePosition(x, y) {
    const { element } = main.chat.hover;

    // Offset to the top right
    x += rootFontSize;
    y -= 2 * rootFontSize;

    // Horizontal position
    const width = element.offsetWidth;
    if (width + x - (0.375 * rootFontSize) > window.innerWidth) x -= width + (2 * rootFontSize);
    if (x < 0) x = 0;

    // Vertical position
    const heigth = element.offsetHeight;
    const windowHeight = window.innerHeight;
    if (heigth + y - (0.1875 * rootFontSize) > windowHeight) y = windowHeight - heigth + (0.1875 * rootFontSize);
    if (y < 0) y = 0;

    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
}