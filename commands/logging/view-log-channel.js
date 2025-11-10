const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const { EMBED_COLORS } = require('../../utility/global/global-vars');
const { setLogChannel, getLogChannel } = require('../../command-handlers/logging/save-log-channels');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('view-log-channel')
        .setDescription('Views the log channel for this server.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) { return interaction.editReply(
                {content: '❌ You do not have permission to manage the server.',flags: MessageFlags.Ephemeral});}

        const channel = getLogChannel(interaction.guild.id);
        
        if (!channel) { return interaction.editReply(
            {content: '❌ No log channel for this server exists', flags: MessageFlags.Ephemeral}
        )}

        await interaction.editReply({ content: `The current log channel for this server is ${channel}`, flags: MessageFlags.Ephemeral });
    },
};