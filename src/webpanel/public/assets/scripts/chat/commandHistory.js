import {clearCompletions, getCompletions} from "./tabComplete.js";
import {moveWindowSelection} from "./utils.js";

export {changeSelectedUsedCommand, addUsedCommand, resetCurrentSelectedUsedCommand};


const maxUsedCommandsCount = 500;

let currentIndex = -1;

function changeSelectedUsedCommand(main, direction = "up") {
    const {usedCommands, input} = main.chat;
    
    let index = currentIndex;

    if (index === -1) {
        if (direction === "down") return;

        if (direction === "up") {
            index = usedCommands.length - 1;
        }
    } else {
        index -= direction === "up" ? 1 : -1;
        
        if (index < 0) return;
        
        if (index > usedCommands.length - 1) {
            index = -1;
        }
    }

    clearCompletions(main);

    currentIndex = index;
    input.innerText = index === -1 ? '' : usedCommands[index];

    moveWindowSelection(input.innerText.length);
    getCompletions(main, input.innerText);
}

function addUsedCommand(main, command) {
    let usedCommands = main.chat.usedCommands;

    if (usedCommands[usedCommands.length - 1] === command) return;

    usedCommands.push(command);

    if (usedCommands.length > maxUsedCommandsCount) {
        usedCommands.shift();
    }
}

function resetCurrentSelectedUsedCommand() {
    currentIndex = -1;
}
