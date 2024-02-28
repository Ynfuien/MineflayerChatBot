import { isScrollOnTheBottom, scrollToBottom } from "./output.js";
import { sendCommand } from "../webSocket.js";
import { getTextWidth, getElementFont } from "../utils/text-width-measurer.js";

export { setup };

/**
 * 
 * @param {import("..").Main} main 
 */
function setup(main) {
    const {input, output} = main.chat;
    const inputElement = input.element;
    
    //// Scroll down button
    let scrollTimeout = 0;
    input.scrollButton.addEventListener("click", () => {
        if (isScrollOnTheBottom(output)) return;

        const now = new Date().getTime();
        if (now - scrollTimeout < 800) return;
        scrollTimeout = now;

        output.style.scrollBehavior = "smooth";
        scrollToBottom(output);
        output.style.scrollBehavior = "";
    });
    

    //// Input
    // Enter press and length limit checking
    inputElement.addEventListener("keypress", (event) => {
        const value = inputElement.innerText;

        if (event.code === "Enter") {
            if (!value) return event.preventDefault();

            sendCommand(value);

            inputElement.innerText = "";

            event.preventDefault();
            return;
        }
        
        if (value.length >= input.lengthLimit) return event.preventDefault();
    });

    inputElement.addEventListener("keydown", (event) => {
        if (event.code !== "Backspace") return;

        setTimeout(() => updateCaret());
    });

    // Remove new line characters from pasted content,
    // and prevent from breaking the lenght limit
    inputElement.addEventListener('paste', (event) => {
        event.preventDefault();

        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        // Remove new lines
        /** @type {string} */
        let paste = (event.clipboardData || window.clipboardData).getData('text');
        paste = paste.replace(/(\n|\r)/g, "");

        
        const range = selection.getRangeAt(0);
        const selectedLenght = Math.abs(range.endOffset - range.startOffset);

        // Keep the length limit
        const inputLength = inputElement.innerText.length;
        if (paste.length + inputLength > input.lengthLimit) {
            const pasteLength = input.lengthLimit - inputLength + selectedLenght;
            paste = paste.substring(0, pasteLength);
        }

        let selectionIndex = Math.min(selection.focusOffset, selection.anchorOffset);
        selectionIndex += paste.length;
        
        // Paste the result
        selection.deleteFromDocument();
        selection.getRangeAt(0).insertNode(document.createTextNode(paste));
        selection.collapseToEnd();

        // Connect all text nodes
        inputElement.innerText = inputElement.innerText;
        for (let i = 0; i < selectionIndex; i++) {
            selection.modify("move", "right", "character");
        }
    });


    document.addEventListener('selectionchange', () => {
        if (document.activeElement !== inputElement) return;

        updateCaret();
    });

    
    const inputFont = getElementFont(inputElement);
    function updateCaret() {
        const selection = window.getSelection();
        const { focusOffset } = selection;

        const inputText = inputElement.innerText;
        if (focusOffset == inputText.length) {
            inputElement.style.setProperty("--vertical-caret-display", "none");
            inputElement.style.setProperty("--horizontal-caret-display", "block");

            return;
        }

        const textBefore = inputText.substring(0, focusOffset);
        const textWidth = getTextWidth(textBefore, inputFont);

        inputElement.style.setProperty("--vertical-caret-position", `${textWidth}px`);
        inputElement.style.setProperty("--vertical-caret-display", "block");
        inputElement.style.setProperty("--horizontal-caret-display", "none");
    }
}