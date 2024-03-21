import { ChatMessage } from "../../../utils/chat-message.js";
import itemAttributes from "./item-attributes.js";


export { setup };

/** @type {import("../../../index.js").Main} */
let main;

/**
 * @param {import("../../../index.js").Main} _main 
 */
function setup(_main) {
    main = _main;

    const { frame } = main.chat.hover;

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
            // updatePosition(x, y);
            show();
            updatePosition(x, y);
            return;
        }
        lastHoverEvent = target;

        frame.textContent = '';

        const json = target.getAttribute("hover-event");
        const parsed = JSON.parse(json);

        const messages = getFinalMessages(parsed);
        if (messages.length === 0) return;

        for (const message of messages) frame.appendChild(message.toHTML("mc-text"));

        // updatePosition(x, y);
        show();
        updatePosition(x, y);
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
 * @param {import("../../../utils/chat-message.js").HoverEvent} hoverEvent
 * @returns {ChatMessage[]}
 */
function getFinalMessages(hoverEvent) {
    const messages = [];
    const { config } = main;

    const { action } = hoverEvent;
    let contents = hoverEvent.contents ?? hoverEvent.value;
    if (Array.isArray(contents)) contents = new ChatMessage({ extra: contents });

    // Show text - mostly custom hover messages
    if (action === "show_text") {
        // Spliting the message every new line,
        // because I need them seperate in the DOM
        const legacy = new ChatMessage(contents).toLegacy();
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
    if (action === "show_entity") {
        const { name, type, id } = contents;
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
    if (action === "show_item") return getShowItemHover(contents);

    return messages;
}

/**
 * Yep. It's a mess...
 * @returns {ChatMessage[]}
 */
function getShowItemHover(contents) {
    const { config } = main;

    const messages = [];

    const { id, tag } = contents;
    if (!id) return messages;

    const translateId = id.replace(':', '.');
    let displayName = config.clientLang[`item.${translateId}`] || config.clientLang[`block.${translateId}`];
    if (!displayName) displayName = translateId;

    const defaultAttributes = itemAttributes[id.substring("minecraft:".length)];

    let displayNameMsg = new ChatMessage(displayName);
    let enchantmentsMsg = [];
    let loreMsg = [];
    const idMsg = new ChatMessage({ color: "dark_gray", text: id });
    let attributeMsg = [];
    let canDestroyMsg = [];
    let unbreakableMsg = [];
    let nbtMsg = null;
    let damageMsg = null;


    let sharpnessLvl = 0;
    if (tag) {
        const nbt = JSON.parse(tag);

        const count = Object.keys(nbt).length;
        if (count > 0) nbtMsg = new ChatMessage({
            color: "dark_gray",
            translate: "item.nbt_tags",
            with: [count.toString()]
        });

        const { display, Damage, Enchantments, CanDestroy, AttributeModifiers, Unbreakable, HideFlags } = nbt;
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

        if (Unbreakable) unbreakableMsg.push(new ChatMessage({ color: "blue", translate: "item.unbreakable" }));

        if (Enchantments) {
            for (const enchant of Enchantments) {
                const { id, lvl } = enchant;
                if (id === "minecraft:sharpness") sharpnessLvl = lvl;

                const enchantMsg = new ChatMessage({
                    color: "gray",
                    translate: `enchantment.${id.replace(':', '.')}`,
                    extra: [
                        { text: " " },
                        lvl <= 10 ? { translate: `enchantment.level.${lvl}` } : { text: lvl }
                    ]
                });

                enchantmentsMsg.push(enchantMsg);
            }
        }

        if (AttributeModifiers) {
            attributeMsg = [];

            const slots = {};

            for (const attribute of AttributeModifiers) {
                const { Slot } = attribute;
                if (!slots[Slot]) slots[Slot] = [];

                slots[Slot].push(attribute);
            }

            for (const slot in slots) {
                // New line
                attributeMsg.push(new ChatMessage());

                // "When in Main Hand:" etc.
                const slotMsg = new ChatMessage({ color: "gray", translate: `item.modifiers.${slot}` });
                attributeMsg.push(slotMsg);

                const attributes = slots[slot];
                for (const attribute of attributes) {
                    let { AttributeName, Amount, Operation } = attribute;

                    if (Amount === 0) continue;
                    if (AttributeName.startsWith("minecraft:")) AttributeName = AttributeName.substring("minecraft:".length);

                    const plus = Amount > 0;
                    if (Operation === 1 || Operation === 2) Amount *= 100;
                    Amount = Math.abs(Amount);

                    const attrMsg = new ChatMessage({
                        color: plus ? "blue" : "red",
                        translate: `attribute.modifier.${plus ? "plus" : "take"}.${Operation}`,
                        with: [
                            { text: Amount },
                            { translate: `attribute.name.${AttributeName}` }
                        ]
                    });

                    attributeMsg.push(attrMsg);
                }
            }
        }

        if (CanDestroy) {
            canDestroyMsg.push(new ChatMessage());
            canDestroyMsg.push(new ChatMessage({ color: "gray", translate: "item.canBreak" }))
            for (const id of CanDestroy) {
                let translated = config.clientLang[`item.${id.replace(':', '.')}`] ?? config.clientLang[`block.${id.replace(':', '.')}`];
                canDestroyMsg.push(new ChatMessage({ color: "dark_gray", text: translated }));
            }
        }

        if (Damage) {
            const item = config.itemsData[id.substring("minecraft.".length)];
            let maxDurability = item?.maxDurability;
            if (!maxDurability) maxDurability = 0;

            damageMsg = new ChatMessage({
                color: "white",
                translate: "item.durability",
                with: [
                    maxDurability - Damage,
                    maxDurability
                ]
            });
        }
    }


    if (defaultAttributes && attributeMsg.length === 0) {
        const slots = {};

        for (const attribute of defaultAttributes) {
            const { slot } = attribute;
            if (!slots[slot]) slots[slot] = [];

            slots[slot].push(attribute);
        }

        for (const slot in slots) {
            // New line
            attributeMsg.push(new ChatMessage());

            // "When in Main Hand:" etc.
            const slotMsg = new ChatMessage({ color: "gray", translate: `item.modifiers.${slot}` });
            attributeMsg.push(slotMsg);

            const attributes = slots[slot];
            for (const attribute of attributes) {
                let { value, name } = attribute;
                if (name === "generic.attack_damage" && sharpnessLvl > 0) {
                    value += (sharpnessLvl / 2) + 0.5;
                }

                const attrMsg = new ChatMessage({
                    color: "dark_green",
                    text: " ",
                    translate: "attribute.modifier.equals.0",
                    with: [
                        { text: value },
                        { translate: `attribute.name.${name}` }
                    ]
                });

                attributeMsg.push(attrMsg);
            }
        }
    }


    messages.push(
        displayNameMsg,
        ...enchantmentsMsg,
        ...loreMsg,
        ...attributeMsg,
        ...unbreakableMsg,
        ...canDestroyMsg,
        idMsg
    );
    if (nbtMsg) messages.push(nbtMsg);
    if (damageMsg) messages.push(damageMsg);

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
    const { rootFontSize } = main;
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