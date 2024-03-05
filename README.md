# MCB - Mineflayer Chat Bot
*This project is **WIP**, in the process of rewriting most of the code*

Minecraft bot written in Javascript using [NodeJs](https://nodejs.org) and [Mineflayer](https://www.npmjs.com/package/mineflayer). It was created mainly to help with server and plugin development, since it often requires another player in the game. It's mostly of use when dealing with the chat stuff (who would have thought), and other things requiring a non moving puppet. Also, well, it could be great just as an AFK bot.

**! Using bot on public servers will probably get you banned. You have been warned !**


# Description
### Features:
- Connecting to Minecraft servers (I know, WOW)
- Support (in theory) 1.8-1.20.4 - Tested on **1.20.2**
- Bot commands
  - Stopping, starting and restarting bot
  - Right/left clicking inventory slots
- Ignoring chat messages by RegEx patterns
- Chat logs in SQLite3 database
- Ability to execute commands on join
- Auto rejoin function with custom timeout
- Online panel with
  - chat logs
  - command execution
  - command history
  - tab completion
  - tab list
  - action bar
  - scoreboard (sidebar)
  - without mobile (phone) support

### How to install
1. Download and install [NodeJs](https://nodejs.org), if don't have it
2. Download source code
3. Unpack the archive
4. Run `npm install` in the console in project folder
5. Edit `config.yml` for your preferences
6. Run `start.bat` and enjoy

Online panel by default should be at http://localhost:3000


### Used projects/assets:
- [ascii-table](https://www.npmjs.com/package/ascii-table)
- [better-sqlite3](https://www.npmjs.com/package/better-sqlite3)
- [chalk](https://www.npmjs.com/package/chalk)
- [express](https://www.npmjs.com/package/express)
- [js-yaml](https://www.npmjs.com/package/js-yaml)
- [mineflayer](https://www.npmjs.com/package/mineflayer)
- [nodemon](https://www.npmjs.com/package/nodemon)
- [prismarine-chat](https://www.npmjs.com/package/prismarine-chat)
- [socket.io](https://www.npmjs.com/package/socket.io)
- [yawn-yaml](https://www.npmjs.com/package/yawn-yaml)
- [interact.js](https://interactjs.io)
- [minecraft-font-extractor](https://github.com/Ynfuien/minecraft-font-extractor)
- [GNU Unifont](https://unifoundry.com/unifont/index.html)


# Media
*Old*
#### (On windows I recommend using [Windows Terminal](https://github.com/microsoft/terminal))
![Screenshot](https://i.imgur.com/l6YLHuB.gif)
![Screenshot](https://i.imgur.com/Fx8WeTX.gif)


# License
This project uses [GNU GPLv3](https://github.com/Ynfuien/MineflayerChatBot/blob/main/LICENSE) license.