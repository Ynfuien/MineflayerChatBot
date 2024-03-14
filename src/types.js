const ST = require('./duck-tapes/scoreboard.tape.js');

/**
 * Duck taped bot
 * @typedef {import('mineflayer').Bot & {
 *  duckTape: {
 *      scoreboards: TapedScoreboards
 *  }
 * }} TapedBot
 */

/**
 * Main object used in every corner of the script
 * @typedef {{
 *      bot: TapedBot | null,
 *      dev: boolean,
 *      database: import('better-sqlite3').Database,
 *      webPanel: {
 *          io: import('socket.io').Server,
 *          app: import('express').Express,
 *          server: import('http').Server
 *      },
 *      commands: {
 *          list: Object.<string, import('./handlers/command.handler.js').BotCommand>,
 *          tabComplete: {
 *              lastPacket: {
 *                  start: number,
 *                  length: number,
 *                  transactionId: number,
 *                  matches: {match: string, tooltip: string}[]
 *              } | null
 *          }
 *      },
 *      config: {
 *          values: import('./utils/config-manager.js').Config,
 *          yawn: YAWN.default
 *      },
 *      vars: {
 *          chatLogs: {
 *              enabled: boolean,
 *              limitType?: string,
 *              limit?: number | string
 *          },
 *          onJoin: {
 *              commands: {timeout: number, message: string}[]
 *          },
 *          autoRejoin: {
 *              enabled: boolean,
 *              timeout: number
 *          },
 *          botCommands: {
 *              enabled: boolean,
 *              prefix: string
 *          },
 *          onlinePanel: {
 *              enabled: boolean,
 *              port: number,
 *              messagesLimitType: string,
 *              messagesLimit: number | string,
 *              tabList: {
 *                  enabled: boolean,
 *                  playersInterval?: number
 *              }
 *          },
 *          bot: {
 *              joined: boolean,
 *              logPlayers: boolean,
 *              ignoreActionBar: boolean,
 *              restart: boolean,
 *              stop: boolean   
 *          }
 *      }
 * }} Main
 */


/**
 * @typedef {{
 *  type: "string" | "compound",
 *  value: string | {color?: object, text?: object}
 * }} NBTTextCompound
 */

// Scoreboard packets
/** 
 * @typedef {{
 *  name: string,
 *  action: 0 | 1 | 2,
 *  displayText: string | NBTTextCompound,
 *  type: 0 | 1,
 *  number_format?: 0 | 1,
 *  styling?: NBTTextCompound
 * }} ScoreboardObjectivePacket
 * 
 * @typedef {{
 *  name: string,
 *  position: 0|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18
 * }} ScoreboardDisplayObjectivePacket
 * 
 * @typedef {{
 *  itemName: string,
 *  action?: 0 | 1,
 *  scoreName: string,
 *  value: number,
 *  display_name?: NBTTextCompound,
 *  number_format?: 0 | 1,
 *  styling?: NBTTextCompound,
 * }} ScoreboardScorePacket
 * 
 * @typedef {{
 *  entity_name: string,
 *  objective_name: string | undefined
 * }} ResetScorePacket
 */

/** 
 * @typedef {{
 *  list: Scoreboard[],
 *  byName: Object.<string, ST.Scoreboard>,
 *  byPosition: {[position in 'list' | 'sidebar' | 'belowName' | 0|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18]: ST.Scoreboard | null},
 * }} TapedScoreboards
 */



module.exports = null;