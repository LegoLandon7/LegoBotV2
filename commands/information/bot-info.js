const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { EMBED_COLORS } = require('../../functions/global/global-vars');
const { formatDuration } = require('../../functions/formatting/format-duration');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bot-info')
        .setDescription('Replies with bot information'),

    async execute(interaction) {
        await interaction.deferReply();

        const botUser = interaction.client.user;
        const botMember = interaction.guild?.members.me;

        const embed = new EmbedBuilder()
            .setTitle(`${botUser.tag}`)
            .setThumbnail(botUser.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setColor(EMBED_COLORS.NORMAL)
            .addFields(
                {
                    name: '🤖  Bot Information:',
                    value: [
                        `• **Name:** ${botUser.username}`,
                        `• **Creator:** cc_landonlego`,
                        `• **Github:** [github](https://github.com/LegoLandon7/LegoBotV2)`,
                        `• **Invite Bot:** [invite](https://discord.com/oauth2/authorize?client_id=1434731473201664122&permissions=8&integration_type=0&scope=bot)`,
                        `• **Uptime:** ${formatDuration(interaction.client.uptime)}`,
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