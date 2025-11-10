const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const { EMBED_COLORS } = require('../../utility/global/global-vars');
const { setLogChannel, getLogChannel, getWelcomeChannel } = require('../../command-handlers/logging/save-log-channels');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('view-welcome-channel')
        .setDescription('Views the welcome channel for this server.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) { return interaction.editReply(
                {content: '❌ You do not have permission to manage the server.',flags: MessageFlags.Ephemeral});}

        const channel = getWelcomeChannel(interaction.guild.id);
        
        if (!channel) { return interaction.editReply(
            {content: '❌ No welcome channel for this server exists', flags: MessageFlags.Ephemeral}
        )}

        await interaction.editReply({ content: `The current welcome channel for this server is ${channel}`, flags: MessageFlags.Ephemeral });
    },
};