const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const { EMBED_COLORS } = require('../../utility/global/global-vars');
const { setLogChannel, getLogChannel, getWelcomeChannel, setWelcomeChannel } = require('../../command-handlers/logging/save-log-channels');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-welcome-channel')
        .setDescription('Sets a welcome channel for this server.')
        .addChannelOption(option =>
            option.setName('target_channel')
                .setDescription('The channel to set as the welcome channel.')
                .setRequired(true)
        ).setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const channel = interaction.options.getChannel('target_channel');

        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {return interaction.editReply(
            {content: '❌ You do not have permission to manage the server.', flags: MessageFlags.Ephemeral});}

        const previous = getWelcomeChannel(interaction.guild.id);
        setWelcomeChannel(interaction.guild.id, channel.id);

        const embed = new EmbedBuilder()
            .setTitle('💯 Welcome Channel Set')
            .setColor(EMBED_COLORS.GOOD)
            .setDescription([
                `• **Welcome Channel:** ${channel}`,
                previous ? `• **Previous:** <#${previous}>` : ''
            ].filter(Boolean).join('\n'))
            .setFooter({
                text: `welcome channel set by ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true })
            }).setTimestamp();

        try {
            await interaction.editReply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        } catch (err) {
            console.error(`set welcome channel error: ${err}`);
            await interaction.editReply({
                content: '❌ Failed to set welcome channel.',
                flags: MessageFlags.Ephemeral
            });
        }
    },
};