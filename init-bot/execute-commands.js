const { MessageFlags } = require('discord.js');

function handleSlashCommands(client) {
    const cooldowns = new Map();

    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        const { user } = interaction;

        const now = Date.now();
        const cooldownAmount = (command.cooldown || 3) * 1000; // default: 3 seconds

        if (!cooldowns.has(command.data.name)) {
            cooldowns.set(command.data.name, new Map());
        }

        const timestamps = cooldowns.get(command.data.name);

        if (timestamps.has(user.id)) {
            const expirationTime = timestamps.get(user.id) + cooldownAmount;

            if (now < expirationTime) {
                const remaining = ((expirationTime - now) / 1000).toFixed(1);
                return interaction.reply({
                    content: `⏳ You’re on cooldown! Try again in **${remaining}s**.`,
                    flags: MessageFlags.Ephemeral
                });
            }
        }

        timestamps.set(user.id, now);
        setTimeout(() => timestamps.delete(user.id), cooldownAmount);

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(`❌ Error executing /${interaction.commandName}:`, error);

            const errorMsg = {
                content: '❌ There was an error while executing this command!',
                flags: MessageFlags.Ephemeral
            };

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(errorMsg).catch(() => {});
            } else {
                await interaction.reply(errorMsg).catch(() => {});
            }
        }
    });
}

module.exports = { handleSlashCommands };