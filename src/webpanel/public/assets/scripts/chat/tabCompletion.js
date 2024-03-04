import { sendTabCompletionRequest } from "../webSocket.js";
import { getTextWidth, getElementFont } from "../utils/text-width-measurer.js";

export { setup, showCompletions, getCompletions, clear };

/** @type {import("..").Main} */
let main = null;
/** @type {HTMLDivElement} */
let inputElement = null;
/** @type {import("..").Main.chat.tabCompletion} */
let tabCompletion = null;
/** @type {string} */
let inputFont = null;

/**
 * @param {import("..").Main} _main 
 */
function setup(_main) {
    main = _main;

    inputElement = main.chat.input.element;
    tabCompletion = main.chat.tabCompletion;
    inputFont = getElementFont(inputElement);

    tabCompletion.element.style.setProperty("--max-visible-size", tabCompletion.maxVisibleSize);


    inputElement.addEventListener("input", () => {
        tabCompletion.changingTheInput = true;
        getCompletions();
        
        setTimeout(() => {
            tabCompletion.changingTheInput = false;   
        });
    });

    document.addEventListener('selectionchange', () => {
        if (document.activeElement !== inputElement) return;
        if (tabCompletion.changingTheInput) return;

        getCompletions();
    });

    inputElement.addEventListener("keydown", (event) => {
        const {key} = event;

        if (!["Tab", "Escape", "ArrowDown", "ArrowUp"].includes(key)) return;
        event.preventDefault();
        event.stopPropagation();

        if (key === "Tab") {
            tabCompletion.usedTab = true;
            return complete(event.shiftKey);
        }

        if (key === "Escape") return clear();

        if (tabCompletion.shown) {
            if (key === "ArrowDown") return changeTheHighlight(tabCompletion.highlightedIndex + 1);
            if (key === "ArrowUp") return changeTheHighlight(tabCompletion.highlightedIndex - 1);
        }
    });
    
    tabCompletion.list.addEventListener("wheel", (event) => {
        event.preventDefault();

        const down = event.deltaY > 0;
        scrollTheList(down);
    });
}

function getCompletions() {
    if (!main) return;

    // Get input value and replace weird spaces (like no-break space) with a normal space
    const value = inputElement.innerText.replace(/[\u00A0\u180E\u2000-\u200B\u202F\u205F\u3000\uFEFF]/g, " ");
    const firstWord = value.split(' ')[0];
    // If a command is longer than 65 chars, bot is kicked out of the server,
    // after sending the tab completion packet. (Tested on Purpur)
    if (firstWord.startsWith('/') && firstWord.length > 65) {
        clear();
        return;
    }
    
    const cursorIndex = window.getSelection().focusOffset;
    sendTabCompletionRequest(value.substring(0, cursorIndex));
}

function showCompletions() {
    if (!main) return;

    const { data } = tabCompletion;

    if (!tabCompletion.usedTab && data.type === "usernames") {
        clear();
        return;
    }

    clear();

    if (data.list.length === 0) return;
    tabCompletion.shown = true;

    const inputText = inputElement.innerText;
    updatePosition(inputText.substring(0, data.start));

    tabCompletion.inputTextBeforeTabbing = inputText;


    updateTheList(data.list);
    changeTheHighlight(0);

    updateListOverflowBorders();
}

/**
 * 
 * @param {number} index
 */
function changeTheHighlight(index) {
    if (!main) return;

    const { data, list: listElement, placeholder: placeholderElement } = tabCompletion;
    const { list, start, length } = data;

    const size = list.length;
    if (size <= 0) {
        updateThePlaceholder();
        return;
    }

    // If index is outsite of completions array
    if (index > size - 1) index = 0;
    if (index < 0) index = size - 1;
    tabCompletion.highlightedIndex = index;

    // Selected class
    for (const child of listElement.children) child.classList.remove("selected");
    
    const selected = Array.from(listElement.children)[index];
    selected.classList.add("selected");


    // Placeholder visibility
    placeholderElement.innerText = list[index];
    const currentCompletionInput = inputElement.innerText.substring(start, start + length);
    if (!placeholderElement.innerText.startsWith(currentCompletionInput) || tabCompletion.completedIndex !== null) placeholderElement.classList.add("hidden");
    else placeholderElement.classList.remove("hidden");

    updateThePlaceholder();

    // Scroll
    updateTheListScroll();
}

function updateThePlaceholder() {
    if (!main) return;

    const { data, placeholder, highlightedIndex, completedIndex } = tabCompletion;
    const { list, start, length } = data;

    const highlightedItem = list[highlightedIndex];
    placeholder.textContent = highlightedItem.substring(length);

    const inputText = inputElement.innerText;
    const currentCompletionInput = inputText.substring(start, start + length);
    const width = getTextWidth(currentCompletionInput, inputFont);
    placeholder.style.setProperty("--padding-left", `${width}px`);
    
    let hidden = (function() {
        if (completedIndex !== null) return true;
        if (!highlightedItem.startsWith(currentCompletionInput)) return true;
        if (inputText.length > start + length) return true;

        return false;
    })();
    
    if (hidden) placeholder.classList.add("hidden");
    else placeholder.classList.remove("hidden");
}

/**
 * @param {boolean} shift 
 */
function complete(shift) {
    if (!main) return;

    if (!tabCompletion.shown) {
        getCompletions();
        return;
    }


    let index = tabCompletion.highlightedIndex;
    if (index === tabCompletion.completedIndex) index += shift ? -1 : 1;

    tabCompletion.completedIndex = index;

    changeTheHighlight(index);
    changeInputText();
}


function changeInputText() {
    if (!main) return;

    const { highlightedIndex, data } = tabCompletion;


    const inputText = tabCompletion.inputTextBeforeTabbing;
    const selectedCompletion = data.list[highlightedIndex];


    const { start, length } = data;

    const textBeforeCompletion = inputText.substring(0, start);
    const textAfterCompletion = inputText.substring(start + length);
    const resultInput = textBeforeCompletion + selectedCompletion + textAfterCompletion;


    tabCompletion.changingTheInput = true;

    inputElement.innerText = resultInput;
    updatePosition(textBeforeCompletion);

    const caretIndex = textBeforeCompletion.length + selectedCompletion.length;
    const windowSelection = getSelection();
    for (let i = 0; i < caretIndex; i++) {
        windowSelection.modify("move", "right", "character");
    }

    setTimeout(() => {
        tabCompletion.changingTheInput = false;
    });
}

/**
 * 
 * @param {string[]} list 
 */
function updateTheList(list) {
    if (!main) return;

    const { list: listElement } = tabCompletion;

    // Append all items to the list
    for (let i = 0; i < list.length; i++) {
        const item = list[i];

        const li = document.createElement("li");
        li.innerText = item;

        //// Mouse events
        li.addEventListener("mouseenter", (event) => {
            if (list.length < 2) return;
    
            changeTheHighlight(i);
        });
    
        li.addEventListener("click", (event) => {
            if (list.length < 1) return;

            changeTheHighlight(i);
            changeInputText();
            return;
        });

        listElement.appendChild(li);
    }

    // Select the first item
    const firstChild = listElement.firstElementChild;
    if (!firstChild) return;

    firstChild.classList.add("selected");
}

/**
 * 
 * @param {boolean} down
 */
function scrollTheList(down = true) {
    if (!main) return;

    const { scrollIndex } = tabCompletion;

    updateTheListScroll(scrollIndex + (down ? 1 : -1));
}

/**
 * 
 * @param {number | null} index 
 * @returns 
 */
function updateTheListScroll(index = null) {
    if (!main) return;

    const { list, maxVisibleSize, highlightedIndex, scrollIndex } = tabCompletion;

    // Setting the step size, on the first use of the function.
    if (!updateTheListScroll.stepSize) {
        const listStyles = getComputedStyle(list);
        const itemStyles = getComputedStyle(list.querySelector("li"));

        const rowGap = parseInt(listStyles.rowGap.replace("px", ""));
        const height = parseInt(itemStyles.height.replace("px", ""));
        
        updateTheListScroll.stepSize = rowGap + height;
    }
    
    const { stepSize } = updateTheListScroll;

    if (index !== null) {
        tabCompletion.scrollIndex = index;
        list.scrollTo(0, index * stepSize);
        return;
    }

    // Scroll down
    if (highlightedIndex >= scrollIndex + maxVisibleSize) {
        const newScrollIndex = highlightedIndex - maxVisibleSize + 1;
        tabCompletion.scrollIndex = newScrollIndex;
        list.scrollTo(0, newScrollIndex * stepSize);
    }

    // Scroll up
    if (highlightedIndex < scrollIndex) {
        tabCompletion.scrollIndex = highlightedIndex;
        list.scrollTo(0, highlightedIndex * stepSize);
    }

    updateListOverflowBorders();
}

function updateListOverflowBorders() {
    if (!main) return;

    const { list, data, maxVisibleSize, scrollIndex } = tabCompletion;
    const { classList } = list;

    const dataSize = data.list.length;

    if (dataSize > maxVisibleSize) classList.add("overflow");
    else classList.remove("overflow");


    if (scrollIndex > 0) classList.add("top-overflow");
    else classList.remove("top-overflow");

    if (scrollIndex + maxVisibleSize < dataSize) classList.add("bottom-overflow");
    else classList.remove("bottom-overflow");
}

/**
 * 
 * @param {string} text
 */
function updatePosition(text) {
    if (!main) return;
    if (!inputFont) return;

    const { element, placeholder } = tabCompletion;

    const width = getTextWidth(text, inputFont);
    element.style.setProperty("--left", `${width}px`);

    if (inputElement.innerText.length === 0) placeholder.style.setProperty("--padding-left", "0");
    else placeholder.style.removeProperty("--padding-left");
}

function clear() {
    if (!main) return;
    
    const { list, placeholder } = tabCompletion;

    list.textContent = '';
    placeholder.textContent = '';

    tabCompletion.shown = false;
    tabCompletion.usedTab = false;
    tabCompletion.completedIndex = null;
    tabCompletion.scrollIndex = 0;
    tabCompletion.highlightedIndex = 0;
}

