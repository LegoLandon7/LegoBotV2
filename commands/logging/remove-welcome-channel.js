const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const { EMBED_COLORS } = require('../../functions/global/global-vars');
const { setLogChannel, getLogChannel, removeLogChannel, getWelcomeChannel, removeWelcomeChannel } = require('../../command-handlers/logging/save-log-channels');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove-welcome-channel')
        .setDescription('Removes the welcome channel from this server.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {return interaction.editReply(
            {content: '❌ You do not have permission to manage the server.',flags: MessageFlags.Ephemeral});}

        const current = getWelcomeChannel(interaction.guild.id);

        if (!current) {return interaction.editReply(
            {content: '⚠️ No welcome channel is currently set for this server.',flags: MessageFlags.Ephemeral,});}

        const channel = await interaction.guild.channels.fetch(current).catch(() => null);

        removeWelcomeChannel(interaction.guild.id);

        const verifyRemoval = getLogChannel(interaction.guild.id);
        if (verifyRemoval) {return interaction.editReply(
            {content: '❌ Failed to remove the log channel from configuration.',flags: MessageFlags.Ephemeral});}

        const embed = new EmbedBuilder()
            .setTitle('🔨 Welcome Channel Removed')
            .setColor(EMBED_COLORS.BAD)
            .setDescription(`**Removed Welcome Channel:** ${channel}`)
            .setFooter({
                text: `welcome channel removed by ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true })
            }).setTimestamp();

        try {
            await interaction.editReply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        } catch (err) {
            console.error(`remove welcome channel error: ${err}`);
            await interaction.editReply({
                content: '❌ Failed to remove welcome channel.',
                flags: MessageFlags.Ephemeral
            });
        }
    },
};