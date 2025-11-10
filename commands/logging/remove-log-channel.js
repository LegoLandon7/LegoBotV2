const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const { EMBED_COLORS } = require('../../utility/global/global-vars');
const { setLogChannel, getLogChannel, removeLogChannel, removeWelcomeChannel } = require('../../command-handlers/logging/save-log-channels');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove-log-channel')
        .setDescription('Removes the log channel from this server.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {return interaction.editReply(
            {content: '❌ You do not have permission to manage the server.',flags: MessageFlags.Ephemeral});}

        const current = getLogChannel(interaction.guild.id);

        if (!current) {return interaction.editReply(
            {content: '⚠️ No log channel is currently set for this server.',flags: MessageFlags.Ephemeral,});}

        const channel = await interaction.guild.channels.fetch(current).catch(() => null);

        removeLogChannel(interaction.guild.id);

        const verifyRemoval = getLogChannel(interaction.guild.id);
        if (verifyRemoval) {return interaction.editReply(
            {content: '❌ Failed to remove the log channel from configuration.',flags: MessageFlags.Ephemeral});}

        const embed = new EmbedBuilder()
            .setTitle('🔨 Log Channel Removed')
            .setColor(EMBED_COLORS.BAD)
            .setDescription(`**Removed Log Channel:** ${channel}`)
            .setFooter({
                text: `log channel removed by ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true })
            }).setTimestamp();

        try {
            await interaction.editReply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        } catch (err) {
            console.error(`remove log channel error: ${err}`);
            await interaction.editReply({
                content: '❌ Failed to remove log channel.',
                flags: MessageFlags.Ephemeral
            });
        }
    },
};