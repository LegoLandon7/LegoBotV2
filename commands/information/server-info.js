const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { EMBED_COLORS } = require('../../utility/global/global-vars');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server-info')
        .setDescription('Replies with server information'),

    async execute(interaction) {
        await interaction.deferReply();

        const guild = interaction.guild;

        const embed = new EmbedBuilder()
            .setTitle(`${guild.name}`)
            .setThumbnail(guild.iconURL({ dynamic: true, size: 1024 }))
            .setColor(EMBED_COLORS.NORMAL)
            .addFields(
                {
                    name: '🏛️ Server Information:',
                    value: [
                        `• **Name:** ${guild.name}`,
                        `• **ID:** ${guild.id}`,
                        `• **Owner:** <@${guild.ownerId}>`,
                        `• **Members:** ${guild.memberCount}`,
                        `• **Channels:** ${guild.channels.cache.size}`,
                        `• **Boosts:** ${guild.premiumSubscriptionCount}`,
                        `• **Boost Level:** ${guild.premiumTier}`,
                        `• **Created On:** <t:${Math.floor(guild.createdTimestamp / 1000)}:F>`,
                        `• **Verification Level:** ${guild.verificationLevel}`
                    ].join('\n')
                }
            )
            .setFooter({
                text: `Requested by ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
            }).setTimestamp();


    await interaction.editReply({ embeds: [embed] });

    }
};
