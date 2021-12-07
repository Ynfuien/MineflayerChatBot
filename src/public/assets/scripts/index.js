import {parseMessage} from './modules/YnfuMotdParser.js';
import {loadSocketIoListeners} from './modules/socket.io.js';
import {loadInputEvents} from './modules/inputEvents.js';
import {getCompletions} from './modules/tabComplete.js';

(function(){
    const chat = document.querySelector("section#chat");

    const main = {
        socket: null,
        chat: {
            main: chat,
            output: chat.querySelector("section.output"),
            input: chat.querySelector("section.input > .input"),
            scrollDownButton: chat.querySelector("span#scrollDown"),
            tabCompletion: {
                main: chat.querySelector("section.input > .tab-completion"),
                invisible: chat.querySelector("section.input > .tab-completion > .invisible"),
                visible: chat.querySelector("section.input > .tab-completion > .visible"),
                list: chat.querySelector("section.input > .tab-completion > section"),
                currentlySelected: 0,
                currentlyListIndex: 0,
                tabbing: false,
                beforTabbing: "",
                completions: {
                    list: [],
                    type: "usernames",
                    prefix: ''
                }
            },
            inputChatLimit: 256
        }
    }
    

    try {
        main.socket = io();
    } catch (e) {
        console.log(e);
        main.output.prepend(parseMessage(`Couldn't connect to bot. Error: ${e}`));
        return;
    }

    loadInputEvents(main);
    loadSocketIoListeners(main);

    getCompletions(main, '');
})();

