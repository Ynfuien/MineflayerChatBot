import { isScrollOnTheBottom, scrollToBottom } from "../output/output.js";
import { toggleVisibility as toggleTabListVisibility } from "../../tab-list/tab-list.js";
import { toggleVisibility as toggleScoreboardVisibility } from "../../scoreboard/scoreboard.js";
import { toggleVisibility as toggleMapsVisibility } from "../../maps/maps.js";

import { clear as clearCompletions } from "./tab-completion.js";
import { addCommand as addCommandToHistory, resetCurrentIndex as resetCommandHistoryIndex } from "./command-history.js";
import { save as saveConfiguration } from "../../local-storage.js";

import { sendCommand } from "../../web-socket.js";
import { getTextWidth, getElementFont } from "../../utils/text-width-measurer.js";

export { setup, suggestCommand, insertText };

/** @type {import("../../index.js").Main} */
let main;

/**
 * 
 * @param {import("../../index.js").Main} _main 
 */
function setup(_main) {
    main = _main;

    const { input, output } = main.chat;
    const inputElement = input.element;
    const outputElement = output.element;

    //// Scroll down button
    let scrollTimeout = 0;
    input.scrollButton.addEventListener("click", () => {
        if (isScrollOnTheBottom(outputElement)) return;

        const now = new Date().getTime();
        if (now - scrollTimeout < 800) return;
        scrollTimeout = now;

        outputElement.style.scrollBehavior = "smooth";
        scrollToBottom(outputElement);
        outputElement.style.scrollBehavior = "";
    });

    //// Tab list button
    input.tabListButton.addEventListener("click", () => {
        toggleTabListVisibility(main);
        saveConfiguration(main);
    });

    //// Scoreboard button
    input.scoreboardButton.addEventListener("click", () => {
        toggleScoreboardVisibility(main);
        saveConfiguration(main);
    });

    //// Maps button
    input.mapsButton.addEventListener("click", () => {
        toggleMapsVisibility();
    });


    //// Input
    // Enter press and length limit checking
    inputElement.addEventListener("keypress", (event) => {
        const value = inputElement.innerText.replace(/[\u00A0\u180E\u2000-\u200B\u202F\u205F\u3000\uFEFF]/g, " ");

        if (event.code === "Enter") {
            if (!value) return event.preventDefault();

            sendCommand(value);
            addCommandToHistory(value);

            inputElement.innerText = "";
            clearCompletions();
            resetCommandHistoryIndex();
            updateCaret();

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

/**
 * @param {string} command 
 */
function suggestCommand(command) {
    const { element } = main.chat.input;

    element.textContent = command;
    element.focus();

    const windowSelection = getSelection();
    for (let i = 0; i < command.length; i++) {
        windowSelection.modify("move", "right", "character");
    }
}

/**
 * @param {string} text 
 */
function insertText(text) {
    const { element } = main.chat.input;

    let value = element.textContent;
    if (document.activeElement !== element) return suggestCommand(value + text);

    const windowSelection = getSelection();
    const cursorIndex = windowSelection.focusOffset;
    const before = value.substring(0, cursorIndex);
    const after = value.substring(cursorIndex, value.length);

    element.textContent = before + text + after;

    const index = before.length + text.length;
    for (let i = 0; i < index; i++) {
        windowSelection.modify("move", "right", "character");
    }
}