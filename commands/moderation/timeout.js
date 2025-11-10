const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const { parseDuration, formatDuration } = require('../../utility/formatting/format-duration');
const { EMBED_COLORS } = require('../../utility/global/global-vars');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('times out a user')
        .addUserOption(option => 
            option
                .setName('target_user')
                .setDescription('The user to timeout')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('time')
                .setDescription('Time for the timeout')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the kick')
                .setRequired(false)
        ).setDefaultMemberPermissions(PermissionFlagsBits.TimeoutMembers),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const target = interaction.options.getUser('target_user');

        const time = interaction.options.getString('time');
        const duration = parseDuration(time);

        if (!duration) {return interaction.editReply({
            content: '❌ Invalid time format! Use something like `10s`, `5m`, `1h`, or `1d`.',flags: MessageFlags.Ephemeral});}
        if (duration > 28 * 24 * 60 * 60 * 1000) duration = 28 * 24 * 60 * 60 * 1000; // 28 days
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const member = await interaction.guild.members.fetch(target.id).catch(() => null);

        if (target.id === interaction.user.id) {
            return interaction.editReply({content: '⚠️ You cannot timeout yourself!',flags: MessageFlags.Ephemeral});}
            
        if (!interaction.member.permissions.has(PermissionFlagsBits.TimeoutMembers)) {return interaction.editReply(
            {content: '❌ You do not have permission to timeout members.', flags: MessageFlags.Ephemeral});}

        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.TimeoutMembers)) {return interaction.editReply(
            {content: '❌ I do not have permission to timeout members.', flags: MessageFlags.Ephemeral});}

        if (!member || !member.manageable) {return interaction.editReply(
            {content: '⚠️ I cannot timeout that user (they might have higher permissions than me or are the server owner).',flags: MessageFlags.Ephemeral});}

        await member.timeout(duration, reason);

        try {await target.send(`❌ You have been timed out from: **${interaction.guild}**\nReason: **${reason}**\nFor: **${formatDuration(duration)}**`);
        } catch (err) {console.error(`DM error: ${err}`)}

        const embed = new EmbedBuilder()
            .setTitle("🔨 Added Timeout")
            .setColor(EMBED_COLORS.BAD)
            .setThumbnail(target.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setDescription([
                `• **User:** ${target.tag} (\`${target.id}\`)`,
                `• **Reason:** ${reason}`,
                `• **Time:** ${formatDuration(duration)}`
            ].join('\n'))
            .setFooter({
                text: `Timed out by ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
            }).setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
};