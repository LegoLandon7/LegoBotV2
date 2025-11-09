const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { EMBED_COLORS } = require('../../functions/global/global-vars');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user-info')
        .setDescription('Replies with user information')
        .addUserOption(option => option.setName('target_user')
              .setDescription('The user you want to get information from')
              .setRequired(false)
    ),

    async execute(interaction) {
        await interaction.deferReply();

        const user = interaction.options.getUser('target_user') || interaction.user;
        const member = interaction.guild?.members.cache.get(user.id);

        const embed = new EmbedBuilder()
            .setTitle(`${user.tag}`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setColor(EMBED_COLORS.NORMAL)
            .addFields({
                name: '👤 User Information:',
                value: [
                    `• **Bot:** ${user.bot ? 'Yes' : 'No'}`,
                    `• **Account Created:** <t:${Math.floor(user.createdTimestamp / 1000)}:F>`,
                    member
                        ? `• **Joined Server:** <t:${Math.floor(member.joinedTimestamp / 1000)}:F>`
                        : `• **Joined Server:** *(Not in this server)*`,
                    `• **ID:** ${user.id}`,
                    `• **Username:** ${user.username}`,
                    `• **Nickname:** ${member?.nickname || 'N/A'}`,
                    `• **Roles:** ${member.roles.cache.filter(r => r.name !== "@everyone").map(r => `<@&${r.id}>`).join(" ") || "None"}`
                ].join('\n')
            })
            .setFooter({
                text: `Requested by ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
            }).setTimestamp();

    await interaction.editReply({ embeds: [embed] });

    }
};
