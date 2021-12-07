import {spliceString, insertTextInString, moveWindowSelection} from "./utils.js";

export {addCompletions, clearCompletions, getCompletions, updateInputCompletion, complete, moveSelection};

const maxTabCompletionListSize = 12;

function addCompletions(main, tabbing = false) {
    const {list, completions} = main.chat.tabCompletion;
    let completionsList = completions.list;

    main.chat.tabCompletion.tabbing = false;
    if (!tabbing) {
        if (completions.type === "usernames") {
            clearCompletions(main);
            return;
        }
    }
    

    if (completionsList.length > maxTabCompletionListSize) {
        completionsList = completionsList.slice(0, maxTabCompletionListSize);
    }

    if (completionsList.length < 1) {
        console.log({
            text: "Mniej niż 1!",
            completionsList,
        });
        list.textContent = '';
        return;
    }

    let toRemove = list.children.length;
    for (const completion of completionsList) {
        if (toRemove > 0) {
            toRemove--;
            list.firstElementChild.remove();
        }

        addCompletion(main, completion);
    }

    for (let i = 0; i < toRemove; i++) {
        list.firstElementChild.remove();
    }

    main.chat.tabCompletion.currentlyListIndex = 0;
    main.chat.tabCompletion.currentlySelected = 0;
    list.children[0].classList.add("selected");

    updateInputCompletion(main);
}

function addCompletion(main, completion, prepend = false) {
    const {tabCompletion} = main.chat;
    const {list, input} = tabCompletion;
    const {start} = tabCompletion.completions;
    const completions = tabCompletion.completions.list;

    const div = document.createElement("div");
    div.innerText = completion;

    if (prepend) {
        list.prepend(div);
    }
    else {
        list.appendChild(div);
    }

    div.addEventListener("mouseenter", (e) => {
        if (completions.length < 2) return;

        const index = Array.prototype.indexOf.call(list.children, div);
        const {currentlyListIndex} = tabCompletion;
        changeSelection(main, index + currentlyListIndex);

        updateInputCompletion(main);
    });

    div.addEventListener("click", (e) => {
        if (completions.length < 2) return;

        const {beforeTabbing, currentlyListIndex} = tabCompletion;

        const index = Array.prototype.indexOf.call(list.children, div);
        changeSelection(main, index + currentlyListIndex);

        complete(main);
        return;
    });
}

function updateInputCompletion(main) {
    const {input, tabCompletion} = main.chat;
    const {invisible, visible, completions, currentlySelected} = tabCompletion;
    const {list, type, prefix, start, length} = completions;

    const text = input.innerText;
    // invisible.innerText = text;
    
    visible.textContent = '';
    if (list.length < 1) {
        invisible.innerText = '';
        return;
    };

    // if (typeof vi sible !== "string") {
    //     return;
    // }
    // console.log(instanceof visible);
    // Element.is
    // if (!(visible instanceof HTMLElement)) return;
    if (start !== undefined) {
        invisible.innerText = text.substring(0, start);
        
        const invisibleCompletion = document.createElement("span");
        invisibleCompletion.classList.add("invisible");
        invisibleCompletion.innerText = text.substr(start, length);
        visible.appendChild(invisibleCompletion);

        if (text.length > start + length) return;

        let toComplete = list[currentlySelected];
        if (toComplete === undefined) {
            main.chat.tabCompletion.currentlySelected = 0;
            toComplete = list[0];
        }

        if (!toComplete.startsWith(text.substr(start))) return;

        console.log({
            res: toComplete.startsWith(text.substr(start, length)),
            toComplete,
            substr: text.substr(start, length)
        });

        const visibleNode = document.createTextNode(toComplete.substr(length));
        visible.appendChild(visibleNode);
        return;
    }
    
    let words = text.split(' ');
    let lastWord = words[words.length - 1];
    invisible.innerText = words.slice(0, -1).join(' ') + ' ';

    if (lastWord === undefined) {
        lastWord = '';
    }

    let witoutPrefix = (function(){
        if (words.length > 1) return lastWord;
        
        if (type === "bot-command") {
            invisible.innerText += prefix;
            return lastWord.substr(prefix.length);
        }

        if (type === "minecraft-command") {
            invisible.innerText += '/';
            return lastWord.substr(1);
        }

        return lastWord;
    })();
    
    
    let invisibleCompletion = document.createElement("span");
    invisibleCompletion.classList.add("invisible");
    invisibleCompletion.innerText = lastWord === '' ? ' ' : witoutPrefix;
    visible.appendChild(invisibleCompletion);
    console.log(visible);

    // console.log({words: words, slice: words.slice(0, -1)});

    

    let toComplete = list[currentlySelected];

    if (toComplete === undefined) {
        main.chat.tabCompletion.currentlySelected = 0;
        toComplete = list[0];
    }
    
    // console.log({
    //     toComplete: toComplete,
    //     toCompleteSub: toComplete.substr(witoutPrefix.length),
    //     length: witoutPrefix.length,
    //     witoutPrefix: witoutPrefix,
    //     currentlySelected: currentlySelected
    // });
    // return;
    const visibleNode = document.createTextNode(toComplete.substr(witoutPrefix.length));
    visible.appendChild(visibleNode);
    // visible.innerText += (lastWord === '' ? ' ' : '') + toComplete.substr(witoutPrefix.length);
    // window.visible = visible;
}

function getCompletions(main, command) {
    // console.log({send_command: command});
    main.socket.emit("get-tab-completions", {command: command, timestamp: Date.now()});
}

function clearCompletions(main, option = "all") {
    const {list, invisible, visible} = main.chat.tabCompletion;

    option = option.toLowerCase();

    if (["all", "list"].includes(option)) {
        main.chat.tabCompletion.tabbing = false;
        list.textContent = '';
    }

    if (["all", "input", "invisible"].includes(option)) {
        invisible.innerText = '';
    }

    if (["all", "input", "visible"].includes(option)) {
        visible.innerText = '';
    }
}

function complete(main, shift = false) {
    const {input, tabCompletion} = main.chat;
    const {visible, completions, currentlySelected, tabbing} = tabCompletion;
    const htmlList = tabCompletion.list;
    const {type, start, length, list} = completions;

    let inputValue = input.innerText;
    if (typeof inputValue !== "string") return;

    if (tabbing) {
        if (list.length < 2) return;
        const {beforeTabbing} = tabCompletion;

        // If currently selected completion is the same that is tabbed in input
        if (insertTextInString(beforeTabbing, list[currentlySelected], start) === inputValue) {
            moveSelection(main, shift ? -1 : 1);
        }
        
        const newSelectedIndex = main.chat.tabCompletion.currentlySelected;

        const completion = list[newSelectedIndex];

        input.innerText = insertTextInString(beforeTabbing, completion, start);

        moveWindowSelection(start + completion.length);
        // console.log(start + completion.length);
        return;
    }

    if (type === "usernames" && htmlList.children.length === 0) {
        addCompletions(main, true);
        return;
    }

    
    if (start !== undefined) {
        if (tabCompletion.list.children.length === 0) {
            addCompletions(main);
            return;
        }

        const beforeTabbing = spliceString(inputValue, start, start + length);
        main.chat.tabCompletion.beforeTabbing = beforeTabbing;

        const completion = list[currentlySelected];
        input.innerText = insertTextInString(beforeTabbing, completion, start);
        main.chat.tabCompletion.tabbing = true;

        clearCompletions(main, "visible");

        moveWindowSelection(start + completion.length);
        return;
    }



    let visibleValue = visible.innerText;

    if (!visibleValue) return;
    input.innerText += visibleValue;

    
//     getCompletions(main, input.innerText);

    moveWindowSelection(input.innerText.length);

    clearCompletions(main);
}

function changeSelection(main, index) {
    const {list, currentlyListIndex} = main.chat.tabCompletion;

    // If list has less than 2 elements
    const size = list.length;
    if (size < 2) return;

    // If index is outsite of completions array
    if (index > size - 1) index = 0;
    if (index < 0) index = size - 1;

    // Romoving class 'selected' from another completions
    for (const child of list.children) {
        if (child.classList.contains("selected")) child.classList.remove("selected");
    }
    
    // Adding class 'selected' to new selected completion
    const selected = Array.from(list.children)[index - currentlyListIndex];
    selected.classList.add("selected");

    main.chat.tabCompletion.currentlySelected = index;
    updateInputCompletion(main);
}

function moveSelection(main, count) {
    const {completions, currentlySelected, currentlyListIndex} = main.chat.tabCompletion;
    const htmlList = main.chat.tabCompletion.list;
    const {list} = completions;


    // If list has less than 2 completions
    const size = list.length;
    if (size < 2) return;

    let newSelectedIndex = currentlySelected + count;

    // If new index is outsite of completions array (lower than 0 or higher than max array index)
    if (newSelectedIndex > size - 1) newSelectedIndex = 0;
    if (newSelectedIndex < 0) newSelectedIndex = size - 1;

    // If tabbing up
    if (newSelectedIndex < currentlyListIndex) {
        for (let i = currentlyListIndex; i > newSelectedIndex; i--) {
            htmlList.lastElementChild.remove();
            addCompletion(main, list[i - 1], true);
        }
        main.chat.tabCompletion.currentlyListIndex = newSelectedIndex;
    }

    // If tabbing down
    if (newSelectedIndex > currentlyListIndex + maxTabCompletionListSize - 1) {
        for (let i = currentlyListIndex; i < newSelectedIndex - maxTabCompletionListSize + 1; i++) {
            htmlList.firstElementChild.remove();
            addCompletion(main, list[i + maxTabCompletionListSize]);
        }
        main.chat.tabCompletion.currentlyListIndex = newSelectedIndex - maxTabCompletionListSize + 1;
    }

    changeSelection(main, newSelectedIndex);
}