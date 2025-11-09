const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { EMBED_COLORS } = require('../../functions/global/global-vars');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Shows the avatar of a user')
        .addUserOption(option => 
            option
                .setName('target_user')
                .setDescription('The user to get the avatar from')
                .setRequired(false)
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const user = interaction.options.getUser('target_user') || interaction.user;

        const avatarURL = user.displayAvatarURL({ size: 1024, dynamic: true });
        const png = user.displayAvatarURL({ extension: 'png', size: 1024 });
        const jpg = user.displayAvatarURL({ extension: 'jpg', size: 1024 });
        const webp = user.displayAvatarURL({ extension: 'webp', size: 1024 });

        const embed = new EmbedBuilder()
            .setTitle(`${user.tag}'s Avatar`)
            .setColor(EMBED_COLORS.NORMAL)
            .setDescription(`[PNG](${png}) | [JPG](${jpg}) | [WEBP](${webp})`)
            .setImage(avatarURL)
            .setFooter({
                text: `Requested by ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
            }).setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
};