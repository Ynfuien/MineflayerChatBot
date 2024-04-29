import { insertText, suggestCommand } from "../../input/input.js";

export { setup };


/** @type {import("../../../index.js").Main} */
let main;

/**
 * @param {import("../../../index.js").Main} _main 
 */
function setup(_main) {
    main = _main;

    // Mouse click event
    document.addEventListener("mousedown", (event) => {
        if (!event.shiftKey) return;

        const { x, y } = event;

        const target = getInsertionEventAtCursor(x, y);
        if (!target) return;

        const insertion = target.getAttribute("insertion");
        if (!insertion) return;


        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        
        insertText(insertion);
    });
}

/**
 * Returns a span with a insertion-event, at provided x and y, or false if none found
 * @param {number} x 
 * @param {number} y 
 * @returns {false | HTMLSpanElement}
 */
function getInsertionEventAtCursor(x, y) {
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

    let insertionSpan = false;
    for (const element of elements) {
        if (!(element instanceof HTMLSpanElement)) continue;
        if (element === pre) continue;
        if (!pre.contains(element)) continue;
        if (!element.hasAttribute("insertion")) continue;

        if (insertionSpan && element.contains(insertionSpan)) continue;
        insertionSpan = element;
    }

    return insertionSpan;
}