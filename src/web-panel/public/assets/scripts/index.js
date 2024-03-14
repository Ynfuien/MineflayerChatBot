import { setup as setupWebSocket } from "./web-socket.js";
import { setup as setupChatInputs } from "./chat/input.js";
import { setup as setupChatOutput } from "./chat/output.js";
import { setup as setupTabCompletion } from "./chat/tab-completion.js";
import { setup as setupCommandHistory } from "./chat/command-history.js";

import { ChatMessage } from "./utils/chat-message.js";

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
 *      displayName: ChatMessage,
 *      ping: number,
 *      gamemode: number,
 *      score: null | {
 *          value: number,
 *          numberFormat: undefined | number,
 *          styling: undefined | ChatMessage
 *      }
 * }} Main.tabList.data.player
 * 
 * 
 * @typedef {{
 *      name: string,
 *      displayText: ChatMessage | undefined,
 *      numberFormat: undefined | 0 | 1 | 2,
 *      styling: undefined | ChatMessage,
 *      items: {
 *          name: string,
 *          value: number | string,
 *          displayName: ChatMessage,
 *          numberFormat: undefined | 0 | 1 | 2,
 *          styling: undefined | ChatMessage
 *      }[]
 * }} Main.scoreboard.data.scoreboard
 * 
 * 
 * @typedef {{
 *      socket: SocketIO,
 *      config: {
 *          messagePrefixes: {
 *              minecraft: string,
 *              bot: string
 *          },
 *          clientLang: Object.<string, string>
 *      },
 *      chat: {
 *          element: HTMLDivElement,
 *          input: {
 *              element: HTMLDivElement,
 *              scrollButton: HTMLButtonElement,
 *              tabListButton: HTMLButtonElement,
 *              scoreboardButton: HTMLButtonElement,
 *              lengthLimit: number,
 *              commandHistory: {
 *                  currentIndex: number,
 *                  inputBeforeHistory: string,
 *                  limit: number,
 *                  list: string[]
 *              }
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
 *              header: ChatMessage,
 *              footer: ChatMessage,
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
 *          data: Main.scoreboard.data.scoreboard | null,
 *          limit: number
 *      },
 *      status: HTMLDivElement
 * }} Main
 */

(function () {
    const chat = document.querySelector("section#chat");
    const tabList = document.querySelector("section#tab-list");
    const scoreboard = document.querySelector("#scoreboard");

    /** @type {Main} */
    const main = {
        config: {
            messagePrefixes: {
                minecraft: "",
                bot: "§f§l[BOT] §r"
            },
            clientLang: {}
        },
        chat: {
            element: chat,
            input: {
                element: chat.querySelector("section.input > .input"),
                scrollButton: chat.querySelector("section.input button.scroll"),
                tabListButton: chat.querySelector("section.input button.tab-list"),
                scoreboardButton: chat.querySelector("section.input button.scoreboard"),
                lengthLimit: 256,
                commandHistory: {
                    currentIndex: -1,
                    inputBeforeHistory: "",
                    limit: 300,
                    list: []
                }
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
            data: null,
            limit: 15
        },
        status: document.querySelector("section#status")
    };


    setupWebSocket(main);
    setupChatInputs(main);
    setupChatOutput(main);
    setupTabCompletion(main);
    setupCommandHistory(main);
})();

