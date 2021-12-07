import {getDateAndTime} from './utils.js';
import {parseMessage} from './YnfuMotdParser.js';
import {addCompletions} from './tabComplete.js';

export {loadSocketIoListeners};

function loadSocketIoListeners(main) {
    const {socket} = main;
    const {output} = main.chat;

    let gettingLogs = true;

    console.log("Getting last logs...");
    socket.emit("get-last-logs");

    socket.on("chat-message", data => {
        if (gettingLogs) return;

        const {message, timestamp} = data;

        let msg = `§#bdbdbd[${getDateAndTime(timestamp)}] §f${message}`;
        output.appendChild(parseMessage(msg));
    });

    socket.on("logs-data", data => {
        let messagesData = data.messages;

        console.log(messagesData);
        (async function() {
            console.log("Displaying last logs...");
            const before = Date.now();

            for (const msgData of messagesData) {
                const {message, timestamp} = msgData;
                let msg = `§#bdbdbd[${getDateAndTime(timestamp)}] §f${message}`;
                output.appendChild(parseMessage(msg));
            }

            gettingLogs = false;
            // let string = '';
            // for (const msgData of messagesData) {
            //     const {message, timestamp} = msgData;
            //     let msg = `§#bdbdbd[${getDateAndTime(timestamp)}] §f${message}`;
            //     string += parseMessage(msg).outerHTML;
            // }
            // output.innerHTML = string;
            
            const after = Date.now();
            console.log(`Time: ${(after - before) / 1000}`);
            
            console.log("Last logs displayed!");
            setTimeout(() => {
                output.scrollTo(0, output.scrollHeight);
            }, 100);
        })();
    });

    socket.on("tab-completions", data => {
        main.chat.tabCompletion.completions = data;
        addCompletions(main);
    });
}