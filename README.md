# LegoBotV2
Second version of my discord bot: **LegoBot**

## TO SET UP / CLONE:

First create a .env file in the root folder, this file contains all global-data for the bot.
The file should contain fields containing the bot-token and client-id's.

**The file should look something like this:**

```
BOT_TOKEN=[token]
CLIENT_ID=[id]
```

Then make sure the arguments in the [] brackets are the actual data needed.

### NEXT: 

In the terminal make sure to run the following command:

`npm install discord.js dotenv archiver`

This will install the required libraries for the bot to work.

### LASTLY:

You need to deploy the slash commands, run this command in the terminal:

`npm run deploy-commands`

You will also need to run this again if you edit the slash commands whatsoever.
This command refreshes all slash commands.

### EXTRA:

Make sure the bot has the `admin` & `bot` permissions to be safe.

Also make sure to let the bot allow all presences such as the `Presence Intent`, `Server Members Intent`, and `Message Content Intent`

To run the bot in dev mode run the `npm dev` command

To deploy commands then start the bot at the same time then run the `npm run deploy-start`


### TO RUN:

In the terminal use the following command to run the bot:

`npm start`

## WHAT THIS BOT IS FOR:

This bot is mainly for me `cc_landonlego` to test out making discord bots and coding generally useful commands.

command can include:
- ban
- kick
- purge

*These commands may already be coded or on the way*

### WHERE I PLAN THE BOT TO GO:

I plan for this bot to be able to replace almost every bot people generally use such as giveaways, tickets, music, and much more.
I'm unsure at the moment if it can get to this point but I'd like to.

## NEED HELP?

If you have any questions at all, please feel free to try to dm me on discord `cc_landonlego` or through another source.
These questions can be about the bot, how to clone the bot, or literally anything of the sorts.
