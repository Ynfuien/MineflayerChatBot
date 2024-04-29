import { showMessage, scrollToBottom } from "./chat/output/output.js";
import { showActionBar } from "./chat/output/action-bar.js";
import { updateTabList } from "./tab-list/tab-list.js";
import { showCompletions } from "./chat/input/tab-completion.js";
import { updateScoreboard } from "./scoreboard/scoreboard.js";
import { ChatMessage, setLanguage } from "./utils/chat-message.js";
import { clear as clearMaps, handleMapPacket, updateMapColors } from "./maps/maps.js";
import { updateTranslations } from "./chat/output/events/click-event.js";


export { setup, sendCommand, sendTabCompletionRequest };

/** @type {import("./index.js").Main} */
let main;

/**
 * @param {import("./index.js").Main} main 
 */
function setup(_main) {
    main = _main;

    // Create socket
    let socket;
    try {
        socket = io();
    } catch (e) {
        console.log(e);
        showMessage(main, { message: `Couldn't connect to bot. Error: ${e}`, timestamp: new Date().getTime() });
        return;
    }
    main.socket = socket;

    const { status } = main;
    socket.on("connect", () => {
        status.classList.add("connected");
        status.title = "Panel is connected to the bot!";
    });

    socket.on("disconnect", () => {
        status.classList.remove("connected");
        status.title = "Panel is not connected to the bot!";
    });

    // Config    
    socket.on("config", (data) => {
        for (const key in data) {
            const value = data[key];

            main.config[key] = value;
        }

        updateMapColors();
    });

    // Config    
    socket.on("language", (data) => {
        main.config.clientLang = data.language;

        setLanguage(data.language);
        updateTranslations();
    });

    // Items data    
    socket.on("items-data", (data) => {
        main.config.itemsData = data.itemsData;
    });

    // Map    
    socket.on("map", (data) => {
        handleMapPacket(data);
    });

    // Bot start event    
    socket.on("bot-start", () => {
        clearMaps();

        main.tabList.data.header = null;
        main.tabList.data.footer = null;
        main.tabList.data.players = [];
        updateTabList(main);

        main.scoreboard.data = null;
        updateScoreboard(main);
    });

    // Bot start event    
    socket.on("clear-maps", () => {
        clearMaps();
    });


    // Get last logs
    let gotTheLogs = false;
    console.log("Getting last logs...");
    socket.emit("get-last-logs");

    socket.on("logs-data", (data) => {
        const { messages } = data;

        console.log("Displaying last logs...");
        const before = Date.now();

        const { element: output } = main.chat.output;
        output.textContent = '';
        for (const data of messages) {
            data.message = new ChatMessage(data.message);

            showMessage(main, data, false);
        }

        scrollToBottom(output);

        gotTheLogs = true;

        const after = Date.now();
        console.log(`Displayed messages: ${messages.length}\nTime elapsed: ${(after - before) / 1000}s`);

        console.log("Last logs displayed!");
    });


    // Message event
    socket.on("chat-message", (data) => {
        if (!gotTheLogs) return;

        data.message = new ChatMessage(data.message);
        showMessage(main, data);
    });

    // Acton bar
    socket.on("action-bar", (data) => {
        showActionBar(main, new ChatMessage(data.message));
    });

    // Scoreboard
    socket.on("scoreboard", /** @param {{scoreboard: import('./index.js').Main.scoreboard.data.scoreboard}} data */(data) => {
        const { scoreboard } = data;
        main.scoreboard.data = scoreboard;

        if (scoreboard) {
            const { displayText, items, styling } = scoreboard;
            if (displayText) scoreboard.displayText = new ChatMessage(displayText);
            if (styling) scoreboard.styling = new ChatMessage(styling);

            for (const item of items) {
                const { displayName, styling } = item;

                if (displayName) item.displayName = new ChatMessage(displayName);
                if (styling) item.styling = new ChatMessage(styling);
            }
        }

        updateScoreboard(main);
    });

    // Tab completions
    socket.on("tab-completions", (data) => {
        main.chat.tabCompletion.data = data;

        showCompletions();
    });

    // Tab list
    socket.on("tab-list", (data) => {
        const { header, footer } = data;
        main.tabList.data.header = header ? new ChatMessage(header) : null;
        main.tabList.data.footer = footer ? new ChatMessage(footer) : null;

        updateTabList(main);
    });

    // Player list
    socket.on("player-list", (data) => {
        main.tabList.data.players = data.list;

        for (const player of main.tabList.data.players) {
            player.displayName = new ChatMessage(player.displayName);

            const { score } = player;
            if (score) {
                const { styling } = score;
                if (styling) score.styling = new ChatMessage(styling);
            }
        }

        updateTabList(main);
    });
}

/**
 * @param {string} command 
 */
function sendCommand(command) {
    const { socket } = main;
    if (!socket) return;
    if (!socket.connected) return;

    socket.emit("execute-command", { command });
}

/**
 * @param {string} command 
 */
function sendTabCompletionRequest(command) {
    const { socket } = main;
    if (!socket) return;
    if (!socket.connected) return;

    socket.emit("get-tab-completions", { command, timestamp: Date.now() });
}