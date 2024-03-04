import { setup as setupWebSocket } from "./webSocket.js";
import { setup as setupChatInputs } from "./chat/input.js";
import { setup as setupChatOutput } from "./chat/output.js";
import { setup as setupTabCompletion } from "./chat/tabCompletion.js";

import { sendCommand } from "./webSocket.js";

/**
 * @typedef {{
 *      element: HTMLDivElement,
 *      list: HTMLOListElement,
 *      placeholder: HTMLSpanElement,
 *      maxVisibleSize: number,
 *      shown: boolean,
 *      scrollIndex: number,
 *      highlightedIndex: number,
 *      completedIndex: number | null,
 *      usedTab: boolean,
 *      changingTheInput: boolean,
 *      inputTextBeforeTabbing: string,
 *      data: {
 *          list: string[],
 *          type: string,
 *          start?: number,
 *          length?: number
 *      }
 * }} Main.chat.tabCompletion
 * 
 * 
 * @typedef {{
 *      username: string,
 *      displayName: string,
 *      ping: number,
 *      gamemode: number,
 *      scoreboardValue: number | string | null
 * }} Main.tabList.data.player
 * 
 * 
 * @typedef {{
 *      name: string,
 *      title: string | undefined,
 *      items: {name: string, value: number | string, displayName: string}[]
 * }} Main.scoreboard.data.scoreboard
 * 
 * 
 * @typedef {{
 *      socket: SocketIO,
 *      config: {
 *          chatPatterns: {
 *              minecraft: string,
 *              bot: string
 *          }
 *      }
 *      chat: {
 *          element: HTMLDivElement,
 *          input: {
 *              element: HTMLDivElement,
 *              scrollButton: HTMLButtonElement,
 *              tabListButton: HTMLButtonElement,
 *              lengthLimit: number
 *          },
 *          output: {
 *              element: HTMLDivElement,
 *              scrollStepSize: number
 *          },
 *          actionBar: HTMLDivElement,
 *          tabCompletion: Main.chat.tabCompletion
 *      },
 *      tabList: {
 *          data: {
 *              header: string,
 *              footer: string,
 *              players: Main.tabList.data.player[]
 *          },
 *          elements: {
 *              main: HTMLDivElement,
 *              header: HTMLDivElement,
 *              footer: HTMLDivElement,
 *              list: HTMLOListElement
 *          }
 *      },
 *      scoreboard: {
 *          element: HTMLDivElement,
 *          header: HTMLDivElement,
 *          header: HTMLOListElement,
 *          data: Main.scoreboard.data.scoreboard | null
 *      }
 * }} Main
 */

(function() {
    const chat = document.querySelector("section#chat");
    const tabList = document.querySelector("section#tab-list");
    const scoreboard = document.querySelector("#scoreboard");
    
    /** @type {Main} */
    const main = {
        config: {
            chatPatterns: {
                minecraft: "{message}",
                bot: "&f&l[BOT] &r{message}"
            }
        },
        chat: {
            element: chat,
            input: {
                element: chat.querySelector("section.input > .input"),
                scrollButton: chat.querySelector("section.input button.scroll"),
                tabListButton: chat.querySelector("section.input button.tab-list"),
                lengthLimit: 256
            },
            output: {
                element: chat.querySelector(".output"),
                scrollStepSize: 7
            },
            actionBar: chat.querySelector(".action-bar"),
            tabCompletion: {
                element: chat.querySelector("section.input > .tab-completion"),
                list: chat.querySelector("section.input > .tab-completion > .list"),
                placeholder: chat.querySelector("section.input > .tab-completion > .placeholder"),
                maxVisibleSize: 10,
                shown: false,
                scrollIndex: 0,
                highlightedIndex: 0,
                completedIndex: null,
                usedTab: false,
                changingTheInput: false,
                inputTextBeforeTabbing: "",
                data: {
                    list: [],
                    type: "usernames"
                }
            }
        },
        tabList: {
            data: {
                header: "",
                footer: "",
                players: []
            },
            elements: {
                main: tabList,
                header: tabList.querySelector("header"),
                footer: tabList.querySelector("footer"),
                list: tabList.querySelector("ol")
            }
        },
        scoreboard: {
            element: scoreboard,
            header: scoreboard.querySelector("header"),
            list: scoreboard.querySelector("ol"),
            data: null
        }
    };


    setupWebSocket(main);
    setupChatInputs(main);
    setupChatOutput(main);
    setupTabCompletion(main);

    setTimeout(() => {
        sendCommand("-t");
    }, 100);
})();

