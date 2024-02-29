import { setup as setupWebSocket } from "./webSocket.js";
import { setup as setupChatInputs } from "./chat/input.js";
import { setup as setupChatOutput } from "./chat/output.js";
import { setup as setupTabCompletion } from "./chat/tabCompletion.js";

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
 *              lengthLimit: number
 *          },
 *          output: {
 *              element: HTMLDivElement,
 *              scrollStepSize: number
 *          },
 *          tabCompletion: Main.chat.tabCompletion
 *      },
 *      tabList: {
 *          data: {
 *              header: string,
 *              footer: string,
 *              players: Main.tabList.data.player[]
 *          },
 *          elements: {
 *              header: HTMLDivElement,
 *              footer: HTMLDivElement,
 *              list: HTMLOListElement
 *          }
 *      }
 * }} Main
 */

(function() {
    const chat = document.querySelector("section#chat");
    const tabList = document.querySelector("section#tab-list");
    
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
                scrollButton: chat.querySelector("section.input > button.scroll"),
                lengthLimit: 256
            },
            output: {
                element: chat.querySelector(".output"),
                scrollStepSize: 7
            },
            scrollDownButton: chat.querySelector("#scrollDown"),
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
                header: tabList.querySelector("header"),
                footer: tabList.querySelector("footer"),
                list: tabList.querySelector("ol")
            }
        }
    };


    setupWebSocket(main);
    setupChatInputs(main);
    setupChatOutput(main);
    setupTabCompletion(main);
})();

