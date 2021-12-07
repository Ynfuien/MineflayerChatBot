# **YnfuBot - Minecraft bot**
This is Minecraft bot written in Javascript with [NodeJs](https://nodejs.org) using [mineflayer](https://www.npmjs.com/package/mineflayer). It was created mainly to save chat logs to be able to read them later and to help server owners in testing various functions without having to start another launcher.

**On public servers you use the bot at your own risk!**


# **Description**
### **Features**:
- Connecting to any server with any port
- Connecting using Mojang or Microsoft account or in offline mode
- Bot commands
  - Stopping, starting and restarting bot
  - Config reload and display, setting and getting config's settigns
  - Right/left clicking inventory slots
- Ignoring chat messages by RegEx patterns
- Chat logs in SQLite3 database
- On join commands to execute
- Auto rejoin function with custom timeout
- Online panel with
  - chat
  - sending commands
  - tab completion
- Almost all configurable (If not all, code is open source, so play with it!)

### **In project are used packages:**
- [ascii-table](https://www.npmjs.com/package/ascii-table)
- [better-sqlite3](https://www.npmjs.com/package/better-sqlite3)
- [chalk](https://www.npmjs.com/package/chalk)
- [express](https://www.npmjs.com/package/express)
- [js-yaml](https://www.npmjs.com/package/js-yaml)
- [mineflayer](https://www.npmjs.com/package/mineflayer)
- [nodemon](https://www.npmjs.com/package/nodemon)
- [socket.io](https://www.npmjs.com/package/socket.io)
- [yawn-yaml](https://www.npmjs.com/package/yawn-yaml)

### **How to install (Windows)**
1. Download source code
2. Unpack archive to some folder
3. Run `first-start.bat` file and after successfully packages instalation close console
4. Edit `config.yml` for your preferences
5. Run `start.bat` and enjoy your bot!

### **How to install (Linux)**
So, since you are using linux I assume you know how to use NodeJs and you will handle it without problems

## **Todo:**
- Tab list in online panel
- Config options for turning on/off logging some events (player join, leave, spawn etc)

# **Media**
## **Console**
![Screenshot](https://i.imgur.com/l6YLHuB.gif)
## **Online panel**
![Screenshot](https://i.imgur.com/Fx8WeTX.gif)

# **Default config**
```yaml
server:
  # Server ip
  host: 'localhost'

  # Default Minecraft servers port is 25565. Set this only if server has different port
  # port: 25565

  # Minecraft server version will be selected automatically but if you want specific
  # set this to it e.g. 1.15.2, 1.16.2, 1.17
  # version: '1.16.5'


login:
  # Set this to your email for Minecraft account or to username for online-mode servers
  username: ''

  # Set this only if you use Minecraft account
  # password: ''

  # Only set this if you are using Microsoft account and then set this to 'microsoft'
  # auth: 'mojang'


commands:
  # If you want to disable bot commands, set this to false

  # !!! Command 'config' with subcommands 'set' require system permission
  # to write to this file !!!
  enabled: true

  # Prefix for bot commands. Must be set, otherwise bot commands won't work.
  # If you will want to send message on server that starts with this prefix,
  # just add \ before.
  prefix: '-'


chat:
  # Messages to ignore. Filter use RegExp match. Useful when e.g message on
  # action bar is spaming (Cause action bar is also included to messages)
  ignored-messages:
    # This is for default ActionHealth plugin setting, but better way in that case is to
    # disable it using command /actionhealth toggle. And keep in maind that this RexExp
    # patter might match another message, for example written by player on chat and
    # then it won't be displayed in console, online panel etc.
    # - '^[\w\d_]{3,16}: [❤]{5,}$'

  logs:
    # If logs should be enabled. This function saves every message to file and when you open online
    # panel, displays every mesasge from file on site.
    # !!! This require system permission for write to file logs.log !!!
    enabled: true

    # Type of saved messages limit.
    # count - while adding new message to file, every old message that is over the limit count
    # will be deleted
    # time - while adding new message, every old message that is older than limit, will be deleted
    # infinity - stored messages won't be deleted. Be aware with this setting cause with a lot
    # of saved data log file can be large
    limit-type: 'time'

    # Limit for saved messages. According to the selected type:
    # count - limit in messages count
    # time - limit in minutes
    # infinity - limit doesn't matter
    limit: 2880 # 2880 minutes - 2 days


on-join:
  # Messages/commands to send on join. It's like in console or online panel, if you start message with
  # bot command prefix, then bot command will be executed. If you start message with slash (/),
  # Minecraft command will be executed and if you write just message, this message will be send on chat.

  # Pattern:
  # <timeout>:<message>
  # Timeout is counting in miliseconds after join event

  commands:
    # Some examples:
    # '500:/login mYsUpErSeCrEtPaSsWoRd123'
    # '1000:Hello everyone!''
    # '5000:/home'
    # '5500:/panel'
    # '6000:-inv leftclick 5'


auto-rejoin:
  # Whether bot should rejoin to server when it gets kicked out
  enabled: false

  # Time in seconds before bot again join server
  timeout: 15


online-panel:
  # If you want to disable online panel, set this to false
  enabled: true


  # Port for online panel, default is 3000
  port: 3000

  # Messages to load from logs file to show in online panel when you open it
  last-messages:
    # Type for limit:
    # count - max messages count
    # time - max messages age in minutes
    # all - will load all messages from logs file

    # The more messages to load, the longer the panel will take to load, so
    # don't set limit to high!
    type: 'count'

    # Set it to whatever if type is 'infinity'. 1440 minutes is 24h
    limit: 2000
```