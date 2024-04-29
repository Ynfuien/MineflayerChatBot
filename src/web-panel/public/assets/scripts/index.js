import { setup as setupWebSocket } from "./web-socket.js";
import { setup as setupChat } from "./chat/chat.js";
import { setup as setupMaps } from "./maps/maps.js";

import { load as loadSavedConfiguration } from "./local-storage.js";

import { ChatMessage } from "./utils/chat-message.js";
import { MCMap } from "./maps/maps.js";

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
 *          mapColors: Object.<number, import("./maps/maps.js").Color>,
 *          clientLang: Object.<string, string>
 *      },
 *      chat: {
 *          element: HTMLDivElement,
 *          input: {
 *              element: HTMLDivElement,
 *              scrollButton: HTMLButtonElement,
 *              tabListButton: HTMLButtonElement,
 *              scoreboardButton: HTMLButtonElement,
 *              mapsButton: HTMLButtonElement,
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
 *          hover: {
 *              element: HTMLDivElement,
 *              frame: HTMLDivElement
 *          },
 *          tabCompletion: Main.chat.tabCompletion
 *      },
 *      openUrl: {
 *          element: HTMLDivElement,
 *          lastUrl: string,
 *          text: {
 *              info: HTMLPreElement,
 *              url: HTMLPreElement,
 *              warning: HTMLPreElement
 *          },
 *          buttons: {
 *              yes: HTMLButtonElement,
 *              copy: HTMLButtonElement,
 *              no: HTMLButtonElement
 *          }
 *      }
 *      tabList: {
 *          data: {
 *              header: ChatMessage | null,
 *              footer: ChatMessage | null,
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
 *          list: HTMLOListElement,
 *          data: Main.scoreboard.data.scoreboard | null,
 *          limit: number
 *      },
 *      maps: {
 *          elements: {
 *              main: HTMLDivElement,
 *              viewer: {
 *                  left: HTMLButtonElement,
 *                  img: HTMLImageElement,
 *                  right: HTMLButtonElement
 *              },
 *              list: HTMLOListElement
 *          },
 *          list: MCMap[],
 *          byId: Object.<number, MCMap>
 *      },
 *      status: HTMLDivElement,
 *      rootFontSize: number
 * }} Main
 */

(function () {
    const chat = document.querySelector("section#chat");
    const openUrl = document.querySelector("section#open-url");
    const tabList = document.querySelector("section#tab-list");
    const scoreboard = document.querySelector("#scoreboard");
    const maps = document.querySelector("section#maps");

    /** @type {Main} */
    const main = {
        config: {
            messagePrefixes: {
                minecraft: "",
                bot: "§f§l[BOT] §r"
            },
            mapColors: {},
            clientLang: {}
        },
        chat: {
            element: chat,
            input: {
                element: chat.querySelector("section.input > .input"),
                scrollButton: chat.querySelector("section.input button.scroll"),
                tabListButton: chat.querySelector("section.input button.tab-list"),
                scoreboardButton: chat.querySelector("section.input button.scoreboard"),
                mapsButton: chat.querySelector("section.input button.maps"),
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
            hover: {
                element: chat.querySelector(".hover"),
                frame: chat.querySelector(".hover > .frame")
            },
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
        openUrl: {
            element: openUrl,
            lastUrl: "",
            text: {
                info: openUrl.querySelector(".text > .info"),
                url: openUrl.querySelector(".text > .url"),
                warning: openUrl.querySelector(".text > .warning")
            },
            buttons: {
                yes: openUrl.querySelector(".buttons > .yes"),
                copy: openUrl.querySelector(".buttons > .copy"),
                no: openUrl.querySelector(".buttons > .no")
            }
        },
        tabList: {
            data: {
                header: null,
                footer: null,
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
        maps: {
            elements: {
                main: maps,
                viewer: {
                    left: maps.querySelector("div > button.left"),
                    img: maps.querySelector("div > .map > img"),
                    right: maps.querySelector("div > button.right")
                },
                list: maps.querySelector("ul")
            },
            list: [],
            byId: {}
        },
        status: document.querySelector("section#status"),
        rootFontSize: (function() {
            const documentStyles = getComputedStyle(document.documentElement);
        
            let { fontSize } = documentStyles; // returns string with 'px'
            return parseInt(fontSize.substring(0, fontSize.length - 2));
        })()
    };


    setupWebSocket(main);
    setupChat(main);
    setupMaps(main);

    loadSavedConfiguration(main);

    window.main = main;
})();

