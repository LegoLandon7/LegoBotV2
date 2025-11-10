const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const { EMBED_COLORS } = require('../../utility/global/global-vars');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bans a user')
        .addUserOption(option => 
            option
                .setName('target_user')
                .setDescription('The user to get ban')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the ban')
                .setRequired(false)
        ).setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const target = interaction.options.getUser('target_user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const member = await interaction.guild.members.fetch(target.id).catch(() => null);

        if (target.id === interaction.user.id) {
            return interaction.editReply({content: '⚠️ You cannot kick yourself!',flags: MessageFlags.Ephemeral});}

        if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {return interaction.editReply(
            {content: '❌ You do not have permission to ban members.', flags: MessageFlags.Ephemeral});}

        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {return interaction.editReply(
            {content: '❌ I do not have permission to ban members.', flags: MessageFlags.Ephemeral});}

        if (!member || !member.bannable) {return interaction.editReply(
            {content: '⚠️ I cannot ban that user (they might have higher permissions than me or are the server owner).',flags: MessageFlags.Ephemeral});}

        await member.ban({ reason });

        try {await target.send(`❌ You have been banned from: **${interaction.guild}**\nReason: **${reason}**`);
        } catch (err) {console.error(`DM error: ${err}`)}

        const embed = new EmbedBuilder()
            .setTitle("🔨 Added Ban")
            .setColor(EMBED_COLORS.BAD)
            .setThumbnail(target.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setDescription([
                `• **User:** ${target.tag} (\`${target.id}\`)`,
                `• **Reason:** ${reason}`,
            ].join('\n'))
            .setFooter({
                text: `Banned by ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
            }).setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
};