// Requirements
const { retrieveCommands } = require('./init-bot/retrieve-commands');
const { handleSlashCommands } = require('./init-bot/execute-commands');

require('dotenv').config();

const fs = require('fs');
const path = require('path');

const { REST, Routes } = require('discord.js');
const { Client, GatewayIntentBits, Partials, Collection, 
    ActivityType, PresenceUpdateStatus, Events } = require('discord.js');
const { setPresence } = require('./init-bot/set-presence');

// Client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildMessageReactions
    ],
    partials: [
        'MESSAGE', 
        'CHANNEL', 
        'REACTION', 
        'GUILD_MEMBER', 
        'USER']
});

// Initialize
client.once('clientReady', () => {
    // Commands Initialization
    retrieveCommands(client);
    handleSlashCommands(client);

    // Bot Status
    setPresence(client);

    // Message
    console.log(`✅ Logged in as ${client.user.tag}`);
});

// Command Handlers
const afkHandler = require('./command-handlers/utility/afk-handler.js');
const { triggerHandler } = require('./command-handlers/triggers/trigger-handler.js');
const { loggingHandler } = require('./command-handlers/logging/log-handler.js');

triggerHandler(client);
loggingHandler(client);

client.on('messageCreate', async (message) => {
    try {
        afkHandler(message);
    } catch (err) {
        console.error(`Handler Error: ${err}`)
    }
});

// Login
client.login(process.env.BOT_TOKEN);