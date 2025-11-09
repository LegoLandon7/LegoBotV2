const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const { EMBED_COLORS } = require('../../functions/global/global-vars');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-nick')
        .setDescription('Changes the nickname of a specified user.')
        .addStringOption(option =>
            option
                .setName('nickname')
                .setDescription('The new nickname to assign to the user.')
                .setRequired(true)
        )
        .addUserOption(option =>
            option
                .setName('target_user')
                .setDescription('The user whose nickname you want to change.')
                .setRequired(false)
        ).setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames),

    async execute(interaction) {
        const target = interaction.options.getUser('target_user') || interaction.user;
        const nickname = interaction.options.getString('nickname');

        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageNicknames)) {return interaction.reply(
            {content: '❌ You do not have permission to manage nicknames.',flags: MessageFlags.Ephemeral});}

        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageNicknames)) {return interaction.reply(
            {content: '❌ I do not have permission to manage nicknames.',flags: MessageFlags.Ephemeral});}

        const member = await interaction.guild.members.fetch(target.id).catch(() => null);

        if (!member) {return interaction.reply(
            {content: '⚠️ I could not find that user in this server.',flags: MessageFlags.Ephemeral});}

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            await member.setNickname(nickname);

            const embed = new EmbedBuilder()
                .setColor(EMBED_COLORS.GOOD)
                .setTitle('✏️ Nickname Changed')
                .setDescription([
                    `• **User:** ${target.tag} (\`${target.id}\`)`,
                    `• **Nickname:** ${nickname}`,
                ].join('\n'))
                .setFooter({
                    text: `Changed by ${interaction.user.tag}`,
                    iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
                }).setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (err) {
            console.error(`Nickname error: ${err}`);
            return interaction.editReply(
                {content: '❌ Unable to change nickname. (I might not have permission to modify this user.)'}
            );
        }
    },
};
