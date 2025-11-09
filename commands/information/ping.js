const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with latency information'),

    async execute(interaction) {
        const start = Date.now();
        // Reply
        await interaction.reply({
            content: '🏓 Pinging...',
            withResponse: true, 
            flags: MessageFlags.Ephemeral
        });

        // Calculate Pings
        const roundTrip = Date.now() - start;
        const wsPing = interaction.client.ws.ping;
        await interaction.editReply(`📶 Round-trip latency: **${roundTrip}ms**\n🌐 WebSocket ping: **${wsPing}ms**`);
    }
};
