const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const { EMBED_COLORS } = require('../../utility/global/global-vars');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('un-timeout')
        .setDescription('un-times out a user')
        .addUserOption(option => 
            option
                .setName('target_user')
                .setDescription('The user to un-timeout')
                .setRequired(true)
        ).setDefaultMemberPermissions(PermissionFlagsBits.TimeoutMembers),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const target = interaction.options.getUser('target_user');
        const member = await interaction.guild.members.fetch(target.id).catch(() => null);

        if (target.id === interaction.user.id) {
            return interaction.editReply({content: '⚠️ You cannot un-timeout yourself!',flags: MessageFlags.Ephemeral});}
            
        if (!interaction.member.permissions.has(PermissionFlagsBits.TimeoutMembers)) {return interaction.editReply(
            {content: '❌ You do not have permission to un-timeout members.', flags: MessageFlags.Ephemeral});}

        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.TimeoutMembers)) {return interaction.editReply(
            {content: '❌ I do not have permission to un-timeout members.', flags: MessageFlags.Ephemeral});}

        if (!member || !member.manageable) {return interaction.editReply(
            {content: '⚠️ I cannot un-timeout that user (they might have higher permissions than me or are the server owner).',flags: MessageFlags.Ephemeral});}

        await member.timeout(null, 'Timeout removed').catch(err => console.error(`un-timeout error: ${err}`));

        try {await target.send(`✅ You have been un-timed out from: **${interaction.guild}**`);
        } catch (err) {console.error(`DM error: ${err}`)}

        const embed = new EmbedBuilder()
            .setTitle("🔨 Removed Timeout")
            .setColor(EMBED_COLORS.GOOD)
            .setThumbnail(target.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setDescription([
                `• **User:** ${target.tag} (\`${target.id}\`)`,
            ].join('\n'))
            .setFooter({
                text: `Un-timed out by ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
            }).setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
};