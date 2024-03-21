# MCB - Mineflayer Chat Bot
Minecraft bot written in Javascript using [NodeJs](https://nodejs.org) and [Mineflayer](https://www.npmjs.com/package/mineflayer). It was created mainly to help with server and plugin development, since it often requires another player in the game. It's mostly of use when dealing with the chat stuff (who would have thought), and other things requiring a non moving puppet. Also, well, it could be great just as an AFK bot.

**! Using bot on public servers will probably get you banned. You have been warned !**


# Description
### Features:
- Connecting to Minecraft servers (I know, WOW)
- Support for 1.20 - 1.20.4
- Bot commands
  - Stopping, starting and restarting bot
  - Editing config on runtime
  - Left and right clicking inventory slots
  - Switching and using hotbar slots
- Ignoring chat messages by RegEx patterns
- Chat logs in SQLite3 database
- Ability to execute commands on join
- Auto rejoin function with custom timeout
- Online panel with
  - vanilla look
  - chat - supporting hover messages <sup>[1]</sup>
  - commands - with tab completions and history (arrow up)
  - tab list
  - scoreboard (sidebar)
  - action bar
  - map viewer (filled map)
  - and without mobile (phone) support

<sup>1.</sup> Full support for `show_text` action, but partial support for `show_entity` and `show_item` actions.

### How to install
1. Download and install [NodeJs](https://nodejs.org), if you don't have it
2. Download source code or clone the git repository
3. If needed, unpack the archive
4. Run `npm install` in a console in the project directory
5. Copy `config.default.yml`, rename it to `config.yml` and edit for your preferences
6. Run `start.bat` and enjoy

Online panel by default should be at http://localhost:3000


# Media
### Overall look
![Overall](https://i.imgur.com/XXnRPJP.gif)

### Big tab list on a random server
![Tab list](https://i.imgur.com/ydbsz75.png)

### Tab completions
![Tab completions](https://i.imgur.com/5QeWgfU.gif)


### Used projects/assets:
- [ascii-table](https://www.npmjs.com/package/ascii-table)
- [better-sqlite3](https://www.npmjs.com/package/better-sqlite3)
- [chalk](https://www.npmjs.com/package/chalk)
- [express](https://www.npmjs.com/package/express)
- [js-yaml](https://www.npmjs.com/package/js-yaml)
- [mineflayer](https://www.npmjs.com/package/mineflayer)
- [mojangson](https://www.npmjs.com/package/mojangson)
- [nodemon](https://www.npmjs.com/package/nodemon)
- [prismarine-chat](https://www.npmjs.com/package/prismarine-chat)
- [socket.io](https://www.npmjs.com/package/socket.io)
- [yawn-yaml](https://www.npmjs.com/package/yawn-yaml)
- [interact.js](https://interactjs.io)
- [minecraft-font-extractor](https://github.com/Ynfuien/minecraft-font-extractor)
- [GNU Unifont](https://unifoundry.com/unifont/index.html)
- [Font Awesome](https://fontawesome.com)


# License
This project uses [GNU GPLv3](https://github.com/Ynfuien/MineflayerChatBot/blob/main/LICENSE) license.