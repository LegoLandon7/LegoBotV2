const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const { EMBED_COLORS } = require('../../functions/global/global-vars');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove-role')
        .setDescription('Removes a role to a user')
        .addStringOption(option =>
            option.setName('role')
                .setDescription('The role to remove from the user')
                .setRequired(true)
        )
        .addUserOption(option => 
            option
                .setName('target_user')
                .setDescription('The user to change the role of')
                .setRequired(false)
        ).setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const target = interaction.options.getUser('target_user') || interaction.user;

        const roleInput = interaction.options.getString('role');
        const role =
        interaction.guild.roles.cache.get(roleInput) ||
        interaction.guild.roles.cache.find(r => r.name.toLowerCase() === roleInput.toLowerCase()) ||
        interaction.guild.roles.cache.find(r => `<@&${r.id}>` === roleInput);
        if (!role) return interaction.editReply({ content: '❌ Role not found.', flags: MessageFlags.Ephemeral });

        const member = await interaction.guild.members.fetch(target.id).catch(() => null);

        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {return interaction.editReply(
            {content: '❌ You do not have permission to manage roles.', flags: MessageFlags.Ephemeral});}

        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {return interaction.editReply(
            {content: '❌ I do not have permission to manage roles.', flags: MessageFlags.Ephemeral});}

        if (!member || !member.manageable) {return interaction.editReply(
            {content: '⚠️ I cannot change the role of that that user (they might have higher permissions than me or are the server owner).',flags: MessageFlags.Ephemeral});}
        
        if (interaction.guild.members.me.roles.highest.position <= role.position) {return interaction.editReply({
            content: '⚠️ I cannot remove that role because it is higher than my highest role.',flags: MessageFlags.Ephemeral});}

        if (interaction.member.roles.highest.position <= role.position) {return interaction.editReply({
            content: '⚠️ You cannot remove a role higher or equal to your highest role.', flags: MessageFlags.Ephemeral});}

        if (!member.roles.cache.has(role.id))return interaction.editReply({
            content: `⚠️ ${member.user.tag} does not have the ${role.name} role.`,flags: MessageFlags.Ephemeral});
            
        await member.roles.remove(role).catch(() => null);

        const embed = new EmbedBuilder()
            .setTitle("🔨 Removed Role")
            .setColor(EMBED_COLORS.BAD)
            .setThumbnail(target.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setDescription([
                `• **User:** ${target.tag} (\`${target.id}\`)`,
                `• **Role:** ${role}`,
            ].join('\n'))
            .setFooter({
                text: `Role changed by ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
            }).setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
};