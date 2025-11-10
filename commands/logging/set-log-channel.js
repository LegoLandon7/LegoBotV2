const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const { EMBED_COLORS } = require('../../utility/global/global-vars');
const { setLogChannel, getLogChannel } = require('../../command-handlers/logging/save-log-channels');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-log-channel')
        .setDescription('Sets a log channel for this server.')
        .addChannelOption(option =>
            option.setName('target_channel')
                .setDescription('The channel to set as the log channel.')
                .setRequired(true)
        ).setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const channel = interaction.options.getChannel('target_channel');

        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) { return interaction.editReply(
                {content: '❌ You do not have permission to manage the server.',flags: MessageFlags.Ephemeral});}

        const previous = getLogChannel(interaction.guild.id);
        setLogChannel(interaction.guild.id, channel.id);

        const embed = new EmbedBuilder()
            .setTitle('💯 Log Channel Set')
            .setColor(EMBED_COLORS.GOOD)
            .setDescription([
                `• **Log Channel:** ${channel}`,
                previous ? `• **Previous:** <#${previous}>` : ''
            ].filter(Boolean).join('\n'))
            .setFooter({
                text: `log channel set by ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true })
            }).setTimestamp();

        try {
            await interaction.editReply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        } catch (err) {
            console.error(`set log channel error: ${err}`);
            await interaction.editReply({
                content: '❌ Failed to set log channel.',
                flags: MessageFlags.Ephemeral
            });
        }
    },
};