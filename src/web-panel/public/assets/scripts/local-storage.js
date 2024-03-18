import { isHidden as isTabListHidden, toggleVisibility as toggleTabList } from "./tab-list/tab-list.js";
import { isHidden as isScoreboardHidden, toggleVisibility as toggleScoreboard } from "./scoreboard/scoreboard.js";

export { load, save };

const rootFontSize = (function() {
    const documentStyles = getComputedStyle(document.documentElement);

    let { fontSize } = documentStyles; // returns string with 'px'
    return parseInt(fontSize.substring(0, fontSize.length - 2));
})();

/**
 * @param {import(".").Main} main 
 */
function load(main) {
    const json = localStorage.getItem("saved-data");
    if (!json) return;

    let savedData = {};
    try {
        savedData = JSON.parse(json);
    } catch (e) {
        console.log("An error occured while loading configuration from the local storage:");
        console.log(e);
        return;
    }

    const { commandHistory, toggleStates, chatSize } = savedData;
    if (commandHistory) { 
        main.chat.input.commandHistory.list = commandHistory;
    }

    if (toggleStates) {
        if (!toggleStates.tabList) toggleTabList(main);
        if (!toggleStates.scoreboard) toggleScoreboard(main);
    }

    if (chatSize) {
        const { element: chat } = main.chat.output;

        chat.style.width = `${chatSize.width * rootFontSize}px`;
        chat.style.height = `${chatSize.height * rootFontSize}px`;
    }
}

/**
 * @param {import(".").Main} main 
 */
function save(main) {
    const { element: chat } = main.chat.output;

    const data = {
        commandHistory: main.chat.input.commandHistory.list,
        toggleStates: {
            tabList: !isTabListHidden(main),
            scoreboard: !isScoreboardHidden(main)
        },
        chatSize: {
            height: chat.offsetHeight / rootFontSize,
            width: chat.offsetWidth / rootFontSize
        }
    };

    localStorage.setItem("saved-data", JSON.stringify(data));
}