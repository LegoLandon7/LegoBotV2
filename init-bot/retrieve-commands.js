const fs = require('fs');
const path = require('path');

function retrieveCommands(client) {
    client.commands = new Map();

    const foldersPath = path.join(__dirname, '../commands');
    const commandFolders = fs.readdirSync(foldersPath);

    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);

            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
                console.log(`✅ Loaded command: ${command.data.name}`);
            } else {
                console.log(`⚠️ Skipped invalid command file: ${filePath}`);
            }
        }
    }

    console.log(`📦 Loaded ${client.commands.size} slash commands.`);
}

module.exports = { retrieveCommands };