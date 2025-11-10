const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const { EMBED_COLORS } = require('../../utility/global/global-vars');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('un-ban')
        .setDescription('Un-bans a user')
        .addStringOption(option => 
            option
                .setName('user_id')
                .setDescription('The ID of the user to un-ban')
                .setRequired(true)
        ).setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const userId = interaction.options.getString('user_id');

        if (userId === interaction.user.id) {
            return interaction.editReply({content: '⚠️ You cannot un-ban yourself!',flags: MessageFlags.Ephemeral});}

        if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {return interaction.editReply({
                content: '❌ You do not have permission to un-ban members.', flags: MessageFlags.Ephemeral});}

        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) { return interaction.editReply({
                content: '❌ I do not have permission to un-ban members.', flags: MessageFlags.Ephemeral});}

        // fetch ban info
        const bans = await interaction.guild.bans.fetch();
        let bannedUser = bans.get(userId);

        if (!bannedUser) {return interaction.editReply({
                content: '⚠️ That user is not banned or the provided ID is invalid.',flags: MessageFlags.Ephemeral});}

        await interaction.guild.members.unban(userId);

        try {await bannedUser.user.send(`✅ You have been un-banned from: **${interaction.guild}**`);
        } catch (err) { console.error(`DM error: ${err}`);}

        const embed = new EmbedBuilder()
            .setTitle("🕊️ Removed Ban")
            .setColor(EMBED_COLORS.GOOD)
            .setThumbnail(bannedUser.user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setDescription([
                `• **User:** ${bannedUser.user.tag} (\`${bannedUser.user.id}\`)`,
            ].join('\n'))
            .setFooter({
                text: `Un-banned by ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
            }).setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
};