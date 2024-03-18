/**
 * // Events
 * @typedef {{
 *  action: "show_text" | "show_entity" | "show_item",
 *  contents: string | ChatMessage | {name: string, type: string, id: string} | {id: string, tag: string}
 * }} HoverEvent
 * 
 * @typedef {{
 *  action: "open_url" | "run_command" | "suggest_command" | "change_page" | "copy_to_clipboard",
 *  value: string
 * }} ClickEvent
 */

const styleLegend = {
    colors: {
        black: {
            code: '0',
            value: '#000000'
        },
        dark_blue: {
            code: '1',
            value: '#0000AA'
        },
        dark_green: {
            code: '2',
            value: '#00AA00'
        },
        dark_aqua: {
            code: '3',
            value: '#00AAAA'
        },
        dark_red: {
            code: '4',
            value: '#AA0000'
        },
        dark_purple: {
            code: '5',
            value: '#AA00AA'
        },
        gold: {
            code: '6',
            value: '#FFAA00'
        },
        gray: {
            code: '7',
            value: '#AAAAAA'
        },
        dark_gray: {
            code: '8',
            value: '#555555'
        },
        blue: {
            code: '9',
            value: '#5555FF'
        },
        green: {
            code: 'a',
            value: '#55FF55'
        },
        aqua: {
            code: 'b',
            value: '#55FFFF'
        },
        red: {
            code: 'c',
            value: '#FF5555'
        },
        light_purple: {
            code: 'd',
            value: '#FF55FF'
        },
        yellow: {
            code: 'e',
            value: '#FFFF55'
        },
        white: {
            code: 'f',
            value: '#FFFFFF'
        },
    },
    formats: {
        bold: {
            code: 'l',
            property: "font-weight",
            valueTrue: "bold",
            valueFalse: "normal"
        },
        strikethrough: {
            code: 'm',
            property: "text-decoration-line",
            valueTrue: "line-through",
            valueFalse: "none"
        },
        underlined: {
            code: 'n',
            property: "text-decoration-line",
            valueTrue: "underline",
            valueFalse: "none"
        },
        italic: {
            code: 'o',
            property: "font-style",
            valueTrue: "italic",
            valueFalse: "normal"
        },
        obfuscated: { code: 'k' },
        reset: { code: 'r' }
    },
    getStyleByCode: (code) => {
        for (const item of ["colors", "formats"]) {
            for (const key in styleLegend[item]) {
                const value = styleLegend[item][key].code;
                if (value === code.toLowerCase()) return { type: item, value: key };
            }
        }

        return false;
    }
};

const LEGACY_CHAR = '§';
const reset = () => LEGACY_CHAR + styleLegend.formats.reset.code;


// Keybinds from .minecraft/options.txt
const keybinds = {
    "key.attack": "key.mouse.left",
    "key.use": "key.mouse.right",
    "key.forward": "key.keyboard.w",
    "key.left": "key.keyboard.a",
    "key.back": "key.keyboard.s",
    "key.right": "key.keyboard.d",
    "key.jump": "key.keyboard.space",
    "key.sneak": "key.keyboard.left.shift",
    "key.sprint": "key.keyboard.left.control",
    "key.drop": "key.keyboard.q",
    "key.inventory": "key.keyboard.e",
    "key.chat": "key.keyboard.t",
    "key.playerlist": "key.keyboard.tab",
    "key.pickItem": "key.mouse.middle",
    "key.command": "key.keyboard.slash",
    "key.socialInteractions": "key.keyboard.p",
    "key.screenshot": "key.keyboard.f2",
    "key.togglePerspective": "key.keyboard.f5",
    "key.smoothCamera": "key.keyboard.unknown",
    "key.fullscreen": "key.keyboard.f11",
    "key.spectatorOutlines": "key.keyboard.unknown",
    "key.swapOffhand": "key.keyboard.f",
    "key.saveToolbarActivator": "key.keyboard.c",
    "key.loadToolbarActivator": "key.keyboard.x",
    "key.advancements": "key.keyboard.l",
    "key.hotbar.1": "key.keyboard.1",
    "key.hotbar.2": "key.keyboard.2",
    "key.hotbar.3": "key.keyboard.3",
    "key.hotbar.4": "key.keyboard.4",
    "key.hotbar.5": "key.keyboard.5",
    "key.hotbar.6": "key.keyboard.6",
    "key.hotbar.7": "key.keyboard.7",
    "key.hotbar.8": "key.keyboard.8",
    "key.hotbar.9": "key.keyboard.9"
};

/** @type {Object.<string, string>} */
let language = {};

function setLanguage(_language) {
    language = _language;
}

class ChatMessage {
    //#region Properties
    /** @type {ChatMessage[] | undefined} */
    extra;
    /** @type {string | undefined} */
    text;
    /** @type {string | undefined} */
    translate;
    /** @type {ChatMessage[] | undefined} */
    with;
    /** @type {HoverEvent | undefined} */
    hoverEvent;
    /** @type {ClickEvent | undefined} */
    clickEvent;
    /** @type {string | undefined} */
    insertion;
    /** @type {string | undefined} */
    keybind;
    /** @type {string | undefined} */
    selector;
    /** @type {string | undefined} */
    score;
    /** @type {string | undefined} */
    color;
    /** @type {boolean | undefined} */
    bold;
    /** @type {boolean | undefined} */
    strikethrough;
    /** @type {boolean | undefined} */
    underlined;
    /** @type {boolean | undefined} */
    italic;
    /** @type {boolean | undefined} */
    obfuscated;
    /** @type {boolean | undefined} */
    reset;
    //#endregion

    /**
     * Constructs a ChatMessage object from provided json or existing ChatMessage.
     * @param {object | ChatMessage} json
     */
    constructor(json) {
        // Yes. This and all the ugliness above is just for the nice VS Code IntelliSense
        for (const key in this) delete this[key];

        if (typeof json === "string") {
            this.text = json;
            return;
        }

        for (const key in json) {
            const value = json[key];
            if (value === undefined) continue;

            // Arrays ('extra' and 'with')
            if (Array.isArray(value)) {
                this[key] = value.map(item => new ChatMessage(item));
                continue;
            }

            // Object type - using clone so original json stays intact
            if (typeof value === "object") {
                this[key] = structuredClone(value);
                continue;
            }

            // Format values - parsing 1's and 0's to boolean, because trues and falses look better.
            // Yep, that's the only reason.
            if (key in styleLegend.formats) {
                this[key] = value ? true : false;
                continue;
            }

            // Color - value to lower case, just in case...
            if (key === "color") {
                this[key] = value.toLowerCase();
                continue;
            }

            this[key] = value;
        }
    }

    /**
     * Gets only plain text of the message.
     * @returns {string}
     */
    getText() {
        let result = this.text ?? "";

        const { translate, with: _with, extra, keybind, selector } = this;

        // Translate
        if (translate && _with) {
            const list = [];

            for (const item of _with) {
                list.push(item.getText());
            }

            result += parseTranslate(translate, list);
        }

        // Keybind
        if (keybind) result += parseKeybind(keybind);

        // Selector
        if (selector) result += selector;

        // Extra
        if (extra) {
            for (const item of extra) {
                result += item.getText();
            }
        }

        return result;
    }

    //#region The legacy thingy
    /**
     * Creates a ChatMessage object from a legacy formatted message.
     * @param {string} message 
     * @param {string} codeChar 
     * @returns {ChatMessage}
     */
    static fromLegacy(message, codeChar = LEGACY_CHAR) {
        const codePattern = new RegExp(`${codeChar}(#[a-f\\d]{6}|[a-fk-or\\d])`, "gi");
        const entryPattern = new RegExp(`(${codePattern.source})*(?:(?!${codePattern.source})[\\s\\S])*`, "gi");

        let currentStyling = {};
        const result = [];

        const matches = message.match(entryPattern);
        for (const match of matches) {
            // Empty match
            if (match.length === 0) continue;

            const codes = match.match(codePattern);
            // No styles, just text
            if (!codes) {
                result.push({ text: match });
                continue;
            }

            // Get styles from codes into 'currentStyling'
            let stylesLength = 0;
            for (let code of codes) {
                stylesLength += code.length;

                code = code.substring(1);
                if (code.startsWith("#")) {
                    currentStyling = { color: code };
                    continue;
                }

                const style = styleLegend.getStyleByCode(code);
                if (!style) continue;

                if (style.type === "colors") {
                    currentStyling = { color: style.value };
                    continue;
                }

                if (style.value === "reset") {
                    currentStyling = {};
                    continue;
                }

                currentStyling[style.value] = true;
            }

            const entry = structuredClone(currentStyling);
            entry.text = match.substring(stylesLength);
            result.push(entry)
        }

        return new ChatMessage({ extra: result });
    }

    /**
     * Parses this ChatMessage to a legacy formatted message.
     * @param {string} codeChar 
     * @param {ChatMessage} parentStyling 
     * @returns {string}
     */
    toLegacy(codeChar = null, parentStyling = new ChatMessage()) {
        const { translate, with: _with, extra, text, color, keybind, selector } = this;
        let result = "";

        // Color
        if (color) parentStyling.color = color;

        // Formats
        let negate = false;
        let newFormats = "";
        for (const formatName in styleLegend.formats) {
            if (!(formatName in this)) continue;

            const value = this[formatName];
            if (!value && parentStyling[formatName]) negate = true;
            if (value && !parentStyling[formatName]) newFormats += LEGACY_CHAR + styleLegend.formats[formatName].code;

            parentStyling[formatName] = value;
        }


        if (negate || color) {
            if (parentStyling.color) result += parentStyling.#getStylesInLegacy();
            else result += reset() + parentStyling.#getFormatsInLegacy();
        } else result += newFormats;


        // Text
        if (text) result += text;

        // Translate
        if (translate) {
            const list = [];

            if (_with) {
                // Loop through 'with' items, parse them to legacy,
                // and add one of the 'reset' variants at the end of a string.
                // Can't use the 'extra' parsing logic, because of 'with' items
                // being just a placeholders for the final message.
                for (const item of _with) {
                    const parentStylingClone = parentStyling.clone();
                    parentStylingClone.translate = true;
                    let itemResult = item.toLegacy(null, parentStylingClone);

                    const lastStyle = ChatMessage.getTheLastStyle(itemResult);
                    if (lastStyle.hasAnyStyle()) {
                        if (parentStyling.color) itemResult += parentStyling.#getStylesInLegacy();
                        else itemResult += reset() + parentStyling.#getFormatsInLegacy();
                    }

                    list.push(itemResult);
                }
            }

            result += parseTranslate(translate, list);
        }

        // Keybind
        if (keybind) result += parseKeybind(keybind);

        // Selector
        if (selector) result += selector;

        // Extra
        if (extra) {
            let prevItem = null;
            for (let i = 0; i < extra.length; i++) {
                const item = extra[i];

                const prevItemIsStyled = prevItem && prevItem.hasAnyStyle();
                if (!item.color && prevItemIsStyled && !item.#hasNegatedStyleOf(parentStyling)) {
                    if (parentStyling.color) result += parentStyling.#getStylesInLegacy();
                    else result += reset() + parentStyling.#getFormatsInLegacy();
                }

                result += item.toLegacy(null, parentStyling.clone());
                prevItem = item;
            }
        }

        if (codeChar != null) return result.replace(new RegExp(LEGACY_CHAR, "g"), codeChar);
        return result;
    }

    /**
     * Returns this object's color in legacy formatting.
     * @param {string} codeChar
     * @returns {string}
     */
    #getColorInLegacy(codeChar = LEGACY_CHAR) {
        const { color } = this;
        // None
        if (!color) return "";

        // Hex
        if (color.startsWith("#")) return codeChar + color;
        // Reset
        if (color === "reset") return reset();
        // Named
        return codeChar + styleLegend.colors[color].code;
    }

    /**
     * Returns this object's formats in legacy formatting.
     * @param {string} codeChar
     * @returns {string}
     */
    #getFormatsInLegacy(codeChar = LEGACY_CHAR) {
        let result = "";

        for (const formatName in styleLegend.formats) {
            if (!this[formatName]) continue;

            result += codeChar + styleLegend.formats[formatName].code;
        }

        return result;
    }

    /**
     * Returns this object's styles in legacy formatting.
     * @param {string} codeChar
     * @returns {string}
     */
    #getStylesInLegacy(codeChar = LEGACY_CHAR) {
        return this.#getColorInLegacy(codeChar) + this.#getFormatsInLegacy(codeChar);
    }

    //#endregion

    //#region HTML stuff

    /**
     * Parses this ChatMessage object to a HTML pre tag.
     * @param {string | null} className Class to append to the pre tag
     * @param {boolean} extra Whether to parse also click/hover/insert events
     * @returns {HTMLPreElement}
     */
    toHTML(className = null, extra = false) {
        const pre = document.createElement("pre");
        if (className) pre.classList.add(className);

        //// Parse
        const parsed = this.#toHTML(extra);

        //// Move everything from the parsed <span> to the <pre>
        // Child nodes
        while (parsed.hasChildNodes()) {
            pre.append(parsed.firstChild);
        }

        // Attributes
        for (const attribute of parsed.attributes) {
            const { name, value } = attribute;

            pre.setAttribute(name, value);
        }

        return pre;
    }

    /**
     * @param {boolean} extraParsing 
     * @param {ChatMessage} parentStyling 
     * @returns {HTMLSpanElement}
     */
    #toHTML(extraParsing, parentStyling = new ChatMessage()) {
        const element = document.createElement("span");

        const { translate, with: _with, extra, text, color, keybind, selector } = this;

        if (extraParsing) {
            const { hoverEvent, clickEvent, insertion } = this;
            if (hoverEvent) element.setAttribute("hover-event", JSON.stringify(hoverEvent));
            if (clickEvent) element.setAttribute("click-event", JSON.stringify(clickEvent));
            if (insertion) element.setAttribute("insertion", insertion);
        }

        // Color
        if (color && color !== parentStyling.color) {
            if (color.startsWith("#")) {
                element.style.color = color;
            } else {
                const style = styleLegend.colors[color];
                if (style) element.style.color = style.value;
            }

            parentStyling.color = color;
        }

        // Formats
        let textDecorationChanged = false;
        for (const formatName in styleLegend.formats) {
            if (!(formatName in this)) continue;
            if (formatName === "reset" || formatName === "obfuscated") continue;

            const value = this[formatName];
            if (value === parentStyling[formatName]) continue;

            const style = styleLegend.formats[formatName];
            if (style.property.includes("text-decoration")) {
                textDecorationChanged = true;
            } else element.style.setProperty(style.property, value ? style.valueTrue : style.valueFalse);


            parentStyling[formatName] = value;
        }

        if (textDecorationChanged) {
            for (const formatName of ["strikethrough", "underlined"]) {
                if (!(formatName in parentStyling)) continue;

                const style = styleLegend.formats[formatName];
                const propertyValue = parentStyling[formatName] ? style.valueTrue : style.valueFalse;
                const oldValue = element.style.getPropertyValue(style.property);

                element.style.setProperty(style.property, `${oldValue} ${propertyValue}`);
            }
        }

        let textContent = "";

        // Text
        if (text) textContent += text;

        // Keybind
        if (keybind) textContent += parseKeybind(keybind);

        // Selector
        if (selector) textContent += selector;

        if (textContent) {
            if (extra || translate) {
                const span = document.createElement("span");
                span.innerText = textContent;
                element.appendChild(span);
            } else element.innerText = textContent;
        }

        // Translate
        if (translate) {
            const translateElement = document.createElement("span");

            const list = [];

            if (_with) {
                for (const item of _with) {
                    const itemElement = item.#toHTML(extraParsing, parentStyling.clone());
                    list.push(itemElement);
                }
            }

            let translated = translate;
            if (translate in language) translated = language[translate];
            translated = translated.replace(/%%/g, "%");

            let i = 0;
            let lastIndex = 0;
            const regex = /%(\d+\$)?s/g;
            let result;
            while ((result = regex.exec(translated)) !== null) {
                const { index } = result;
                const match = result[0];
                let itemIndex = result[1];

                if (itemIndex) {
                    itemIndex = parseInt(itemIndex.substring(0, itemIndex.length - 1));
                } else {
                    i++;
                    itemIndex = i;
                }

                const item = list[itemIndex - 1];
                const matchLength = match.length;

                const before = translated.substring(lastIndex, index);
                lastIndex = index + matchLength;

                if (before) {
                    const span = document.createElement("span");
                    span.innerText = before;
                    translateElement.appendChild(span);
                }
                translateElement.appendChild(item.cloneNode(true));
            }

            const end = translated.substring(lastIndex);
            if (end) {
                const span = document.createElement("span");
                span.innerText = end;
                translateElement.appendChild(span);
            }
            element.appendChild(translateElement);
        }

        // Extra
        if (extra) {
            for (const entry of extra) {
                const entryElement = entry.#toHTML(extraParsing, parentStyling.clone());
                if (entryElement.innerText.length === 0 && entryElement.innerHTML.length === 0) continue;
                element.appendChild(entryElement);
            }
        }

        return element;
    }
    //#endregion

    //#region Utilities
    /**
     * 
     * @param {ChatMessage} chatMessage 
     */
    #hasNegatedStyleOf(chatMessage) {
        for (const formatName in styleLegend.formats) {
            if (!(formatName in this)) continue;

            const value = this[formatName];
            if (!value && chatMessage[formatName]) return true;
        }

        return false;
    }

    /**
     * Returns the last style (color and/or formats) in the message.
     * Will return empty ChatMessage if no style found.
     * @returns {ChatMessage}
     */
    getTheLastStyle() {
        return ChatMessage.getTheLastStyle(this.toLegacy());
    }

    /**
     * Returns the last style (color and/or formats) in the message.
     * Will return empty ChatMessage if no style found.
     * @param {string} legacyMessage
     * @returns {ChatMessage}
     */
    static getTheLastStyle(legacyMessage, codeChar = LEGACY_CHAR) {
        if (legacyMessage.trim().length === 0) return new ChatMessage();

        const codePattern = new RegExp(`${codeChar}(#[a-f\\d]{6}|[a-fk-or\\d])`, "gi");
        const matches = legacyMessage.match(codePattern);

        let result = new ChatMessage();
        if (!matches) return result;
        
        for (let i = matches.length; i > 0; i--) {
            const match = matches[i - 1];
            const code = match.substring(1);

            if (code.startsWith("#")) {
                result.color = code;
                break;
            }

            const style = styleLegend.getStyleByCode(code);
            if (!style) continue;

            if (style.type === "colors") {
                result.color = style.value;
                break;
            }

            if (style.value === "reset") break;

            result[style.value] = true;
        }

        return result;
    }

    /**
     * Checks if this ChatMessage has any format applied.
     * 
     * Checks:
     * - bold
     * - strikethrough
     * - underlined
     * - italic
     * - obfuscated
     * - reset
     * @returns {boolean}
     */
    hasAnyFormat() {
        for (const formatName in styleLegend.formats) {
            if (formatName in this) return true;
        }

        return false;
    }

    /**
     * Checks if this ChatMessage has any style applied.
     * 
     * Checks:
     * - color
     * - bold
     * - strikethrough
     * - underlined
     * - italic
     * - obfuscated
     * - reset
     * @returns {boolean}
     */
    hasAnyStyle() {
        return this.color || this.hasAnyFormat();
    }

    /**
     * Clones this ChatMessage object.
     * @returns {ChatMessage}
     */
    clone() {
        return new ChatMessage(this);
    }

    /**
     * Clones and appends provided ChatMessage objects to this object extras.
     * @param  {...ChatMessage} messages
     * @returns {ChatMessage} Reference to the same ChatMessage
     */
    append(...messages) {
        if (!this.extra) this.extra = [];
        const { extra } = this;

        for (const message of messages) {
            extra.push(message.clone());
        }

        return this;
    }
    //#endregion
}


/**
 * Parses 'translate' component
 * @param {string} translate 
 * @param {string[]} list 
 */
function parseTranslate(translate, list) {
    if (translate in language) translate = language[translate];
    translate = translate.replace(/%%/g, "%");

    for (let i = 0; i < list.length; i++) {
        const item = list[i];
        translate = translate.replace(new RegExp(`%${i + 1}$s`, 'g'), item).replace("%s", item);
    }

    return translate;
}

/**
 * Parses 'keybind' component
 * @param {string} keybind
 * @returns {string}
 */
function parseKeybind(keybind) {
    const translate = keybind in keybinds ? keybinds[keybind] : keybind;

    if (translate in language) return language[translate];

    if (!translate.startsWith("key.keyboard.")) return translate;
    const key = translate.substring(13);
    if (key.length === 1) return key.toUpperCase();

    return translate;
}

export { setLanguage, ChatMessage };
window.cm = ChatMessage;