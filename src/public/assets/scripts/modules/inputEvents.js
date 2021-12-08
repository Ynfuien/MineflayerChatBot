import * as tc from "./tabComplete.js";
import {changeSelectedUsedCommand, addUsedCommand, resetCurrentSelectedUsedCommand} from "./usedCommands.js";

export {loadInputEvents};

function loadInputEvents(main) {
    const {socket} = main;
    const {input, output, scrollDownButton, inputChatLimit} = main.chat;

    
    let scrollDown = true;
    let scrollingDown = false;
    
    output.addEventListener("scroll", (e) => {
        if (scrollingDown) {
            scrollingDown = false;
            return;
        }

        const {scrollHeight, scrollTop, offsetHeight} = output;

        const difference = scrollHeight - scrollTop;
        const onBottom = difference === offsetHeight;
        
        if (difference - offsetHeight > 200) scrollDownButton.classList.add("visible");
        else scrollDownButton.classList.remove("visible");

        scrollDown = onBottom;
    });

    let scrollDownButtonCooldown = false;
    scrollDownButton.addEventListener("click", (e) => {
        if (scrollDownButtonCooldown) return;
        scrollDownButtonCooldown = true;

        const {scrollHeight, scrollTop, offsetHeight} = output;

        if (scrollHeight - scrollTop === offsetHeight) return;

        output.style.scrollBehavior = "smooth";
        output.scrollTo(output.scrollLeft, output.scrollHeight);
        output.style.scrollBehavior = "";

        setTimeout(() => {
            scrollDownButtonCooldown = false;
        }, 1000);
    });

    setInterval(() => {
        if (!scrollDown) return;
        if (output.scrollHeight - output.scrollTop === output.offsetHeight) return;

        scrollingDown = true;
        output.scrollTo(output.scrollLeft, output.scrollHeight);
    }, 1);
    
    input.addEventListener("keydown", (e) => {
        const {code} = e;

        if (code === "ArrowLeft" || code === "ArrowRight") {
            if (!input.innerText) return;
            
            setTimeout(() => {
                getTabCompletions();
            }, 5);
            return;
        }

        if (!["Tab", "Escape", "ArrowDown", "ArrowUp"].includes(code)) return;
        cancelEvent(e);

        if (code === "Tab") {
            return tc.complete(main, e.shiftKey);
        }

        if (code === "Escape") {
            return tc.clearCompletions(main, "list");
        }

        if (main.chat.tabCompletion.tabbing) {
            if (code === "ArrowDown") {
                return tc.moveSelection(main, 1);
            }
    
            if (code === "ArrowUp") {
                return tc.moveSelection(main, -1);
            }
            return;
        }

        if (code === "ArrowDown") {
            return changeSelectedUsedCommand(main, "down");
        }

        if (code === "ArrowUp") {
            return changeSelectedUsedCommand(main, "up");
        }
    });

    input.addEventListener("keypress", (e) => {
        let value = input.innerText;
        if (e.code === "Enter") {
            if (!value) return cancelEvent(e);

            socket.emit("send-command", {command: value});

            addUsedCommand(main, value);

            input.innerText = "";
            tc.clearCompletions(main);
            tc.getCompletions(main, '');
            resetCurrentSelectedUsedCommand();
            return cancelEvent(e);
        }

        if (value.length >= inputChatLimit) return cancelEvent(e);
    });

    input.addEventListener('paste', (e) => {
        let paste = (e.clipboardData || window.clipboardData).getData('text');

        const pattern = new RegExp("(\\n|\\r)", 'g');
        if (!paste.match(pattern)) return;
        paste = paste.replace(pattern, '');
    
        const selection = window.getSelection();
        if (!selection.rangeCount) return false;
        e.preventDefault();

        selection.deleteFromDocument();
        let position = selection.focusOffset;
        selection.getRangeAt(0).insertNode(document.createTextNode(paste));
        selection.modify("move", "right", "character");
        
        input.innerText = input.innerText;
        for (let i = 0; i < position + paste.length; i++) {
            selection.modify("move", "right", "character");
        }

        let value = input.innerText;
        if (value.length > inputChatLimit) {
            input.innerText = value.substring(0, inputChatLimit);
            selection.modify("move", "right", "paragraphboundary");
        }

        tc.updateInputCompletion(main);
        getTabCompletions();
    });

    
    input.addEventListener("input", (e) => {
        let value = input.innerText;


        if (value.length > inputChatLimit) {
            input.innerText = value.substring(0, inputChatLimit);
            window.getSelection().modify("move", "right", "paragraphboundary");
        }

        getTabCompletions();

        tc.clearCompletions(main, "visible");
    });

    function getTabCompletions() {
        // I don't know why but using bot.tabComplete() in mineflayer with command longer than 65
        // chars cause servers (at least on Spigot+ (tested on Purpur)) to kick out bot for spamming.
        // I think that might be cause packet size or something about it but on the other hand
        // it only occurs with too long command no matter about it's arguments, sooo I don't know
        const value = input.innerText;
        const firstWord = value.split(' ')[0];
        if (firstWord.startsWith('/') && firstWord.length > 65) {
            tc.clearCompletions(main);
            return;
        }
        
        const cursorIndex = window.getSelection().focusOffset;
        
        tc.getCompletions(main, value.substring(0, cursorIndex));
    }
}

function cancelEvent(event) {
    event.preventDefault();
    event.stopPropagation();
}