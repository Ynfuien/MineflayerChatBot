import { showMessage, scrollToBottom } from "./chat/output.js";
import { showActionBar } from "./chat/actionBar.js";
import { updateTabList } from "./tabList/tabList.js";
import { showCompletions } from "./chat/tabCompletion.js";
import { updateScoreboard } from "./scoreboard/scoreboard.js";

export { setup, sendCommand, sendTabCompletionRequest };

/** @type {import(".").Main} */
let main;

/**
 * @param {import(".").Main} main 
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
        main.config = data;
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
        for (const data of messages) showMessage(main, data, false);

        scrollToBottom(output);

        gotTheLogs = true;

        const after = Date.now();
        console.log(`Displayed messages: ${messages.length}\nTime elapsed: ${(after - before) / 1000}s`);

        console.log("Last logs displayed!");
    });


    // Message event
    socket.on("chat-message", (data) => {
        if (!gotTheLogs) return;

        showMessage(main, data);
    });

    // Acton bar
    socket.on("action-bar", (data) => {
        showActionBar(main, data.message);
    });

    // Acton bar
    socket.on("scoreboard", (data) => {
        main.scoreboard.data = data.scoreboard;
        updateScoreboard(main);
    });

    // Tab completions
    socket.on("tab-completions", (data) => {
        main.chat.tabCompletion.data = data;

        showCompletions();
    });

    // Tab list
    socket.on("tab-list", (data) => {
        main.tabList.data.header = data.header;
        main.tabList.data.footer = data.footer;

        updateTabList(main);
    });

    // Player list
    socket.on("player-list", (data) => {
        main.tabList.data.players = data.list;

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