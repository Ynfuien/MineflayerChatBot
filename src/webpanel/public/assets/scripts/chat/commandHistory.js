export { setup, addCommand, resetCurrentIndex };

/** @type {import("../index.js").Main} */
let main;

/**
 * 
 * @param {import("../index.js").Main} main 
 */
function setup(_main) {
    main = _main;

    const { input, tabCompletion } = main.chat;

    input.element.addEventListener("keydown", (event) => {
        if (tabCompletion.shown) return;
        const { key } = event;
        
        if (key !== "ArrowUp" && key !== "ArrowDown") return;
        event.preventDefault();
        event.stopPropagation();

        tabCompletion.changingTheInput = true;
        changeSelectedCommand(key === "ArrowUp" ? 1 : -1);

        setTimeout(() => {
            tabCompletion.changingTheInput = false;   
        });
    });
}

/**
 * @param {number} offset 
 */
function changeSelectedCommand(offset) {
    const { input } = main.chat;
    const { commandHistory, element: inputElement } = input;
    const { list, currentIndex, inputBeforeHistory } = commandHistory;

    let nextIndex = currentIndex + offset;
    if (nextIndex > list.length - 1) return;

    if (nextIndex < 0) {
        if (nextIndex < -1) return;

        commandHistory.currentIndex = nextIndex;
        setInput(inputElement, inputBeforeHistory);
        commandHistory.inputBeforeHistory = "";
        return;
    }
    

    if (currentIndex === -1) commandHistory.inputBeforeHistory = inputElement.innerText;

    commandHistory.currentIndex = nextIndex;
    const command = list[nextIndex];
    setInput(inputElement, command);
}

/**
 * @param {HTMLDivElement} input 
 * @param {string} text 
 */
function setInput(input, text) {
    input.innerText = text;

    const seleciton = getSelection();
    for (let i = 0; i < text.length; i++) {
        seleciton.modify("move", "right", "character");
    }
}

/**
 * @param {string} command 
 */
function addCommand(command) {
    const { list, limit } = main.chat.input.commandHistory;

    if (list.unshift(command) > limit) list.pop();
}

function resetCurrentIndex() {
    const { commandHistory } = main.chat.input;

    commandHistory.currentIndex = -1;
}