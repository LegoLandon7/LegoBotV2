const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags, Message } = require('discord.js');
const { EMBED_COLORS } = require('../../functions/global/global-vars');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Deletes a specified number of messages from the current channel.')
        .addIntegerOption(option =>
            option
                .setName('amount')
                .setDescription('The number of messages to delete (1–100).')
                .setRequired(true)
        )
        .addUserOption(option =>
            option
                .setName('target_user')
                .setDescription('Only delete messages from this user.')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');
        const target = interaction.options.getUser('target_user');

        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {return interaction.reply(
            {content: '❌ You do not have permission to manage messages.',flags: MessageFlags.Ephemeral});}

        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageMessages)) {return interaction.reply(
            {content: '❌ I do not have permission to delete messages.',flags: MessageFlags.Ephemeral });}

        if (amount < 1 || amount > 100) { return interaction.reply(
            {content: '⚠️ You must specify a number between **1** and **100**.',flags: MessageFlags.Ephemeral});}

        await interaction.deferReply();

        try {
            let deleted;

            // Fetch messages from the channel
            const messages = await interaction.channel.messages.fetch({ limit: 100 });

            if (target) {
                // Filter messages from the target user only
                const userMessages = messages.filter(msg => msg.author.id === target.id).first(amount);
                deleted = await interaction.channel.bulkDelete(userMessages, true);
            } else {
                deleted = await interaction.channel.bulkDelete(amount, true);
            }

            const embed = new EmbedBuilder()
                .setColor(EMBED_COLORS?.Bad || '#ED4245')
                .setTitle('🧹 Messages Purged')
                .setDescription(target
                    ? `Successfully deleted **${deleted.size}** messages from **${target.tag}**.`
                    : `Successfully deleted **${deleted.size}** messages.`)
                .setFooter({
                    text: `Purged by ${interaction.user.tag}`,
                    iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
                }).setTimestamp();

            // Public confirmation message
            const confirmationMessage = await interaction.followUp({ embeds: [embed], flags: 0 });

            setTimeout(async () => {
                try {await confirmationMessage.delete().catch(() => {});} 
                catch (err) {console.error(`Confirmation delete error: ${err}`);}
            }, 5000); // 5 seconds

        } catch (err) {
            console.error(`Purge error: ${err}`);
            return interaction.editReply({
                content: '❌ Error deleting messages. (Messages older than 14 days cannot be deleted.)',
                flags: MessageFlags.Ephemeral,
            });
        }
    },
};