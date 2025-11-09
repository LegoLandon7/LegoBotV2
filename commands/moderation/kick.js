const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const { EMBED_COLORS } = require('../../functions/global/global-vars');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kicks a user')
        .addUserOption(option => 
            option
                .setName('target_user')
                .setDescription('The user to kick')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the kick')
                .setRequired(false)
        ).setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const target = interaction.options.getUser('target_user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const member = await interaction.guild.members.fetch(target.id).catch(() => null);

        if (target.id === interaction.user.id) {
            return interaction.editReply({content: '⚠️ You cannot kick yourself!',flags: MessageFlags.Ephemeral});}
            
        if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {return interaction.editReply(
            {content: '❌ You do not have permission to kick members.', flags: MessageFlags.Ephemeral});}

        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.KickMembers)) {return interaction.editReply(
            {content: '❌ I do not have permission to kick members.', flags: MessageFlags.Ephemeral});}

        if (!member || !member.kickable) {return interaction.editReply(
            {content: '⚠️ I cannot kick that user (they might have higher permissions than me or are the server owner).',flags: MessageFlags.Ephemeral});}

        await member.kick({ reason });

        try {await target.send(`❌ You have been kicked from: **${interaction.guild}**\nReason: **${reason}**`);
        } catch (err) {console.error(`DM error: ${err}`)}

        const embed = new EmbedBuilder()
            .setTitle("🔨 User Kicked")
            .setColor(EMBED_COLORS.BAD)
            .setThumbnail(target.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setDescription([
                `• **User:** ${target.tag} (\`${target.id}\`)`,
                `• **Reason:** ${reason}`,
            ].join('\n'))
            .setFooter({
                text: `Kicked by ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
            }).setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
};