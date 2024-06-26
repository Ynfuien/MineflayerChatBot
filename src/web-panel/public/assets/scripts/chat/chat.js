import { setup as setupInput } from "./input/input.js";
import { setup as setupTabCompletion } from "./input/tab-completion.js";
import { setup as setupCommandHistory } from "./input/command-history.js";

import { setup as setupOutput } from "./output/output.js";
import { setup as setupHoverEvent } from "./output/events/hover-event.js";
import { setup as setupClickEvent } from "./output/events/click-event.js";
import { setup as setupInsertionEvent } from "./output/events/insertion-event.js";

export { setup };

/**
 * @param {import("../index.js").Main} main 
 */
function setup(main) {
    // Input
    setupInput(main);
    setupTabCompletion(main);
    setupCommandHistory(main);

    // Output
    setupOutput(main);
    setupHoverEvent(main);
    setupClickEvent(main);
    setupInsertionEvent(main);
}