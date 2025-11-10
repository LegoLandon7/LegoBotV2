const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags, Collection } = require('discord.js');
const { EMBED_COLORS } = require('../../utility/global/global-vars');

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

        // Permission checks
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return interaction.reply({ content: '❌ You do not have permission to manage messages.', flags: MessageFlags.Ephemeral });
        }

        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return interaction.reply({ content: '❌ I do not have permission to delete messages.', flags: MessageFlags.Ephemeral });
        }

        if (amount < 1 || amount > 100) {
            return interaction.reply({ content: '⚠️ You must specify a number between **1** and **100**.', flags: MessageFlags.Ephemeral });
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            // Fetch messages
            const fetched = await interaction.channel.messages.fetch({ limit: 100 });

            // Filter messages by target user if provided
            let messagesToDelete = target
                ? fetched.filter(msg => msg.author.id === target.id)
                : fetched;

            // Filter out messages older than 14 days
            const fourteenDaysAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
            messagesToDelete = messagesToDelete.filter(msg => msg.createdTimestamp > fourteenDaysAgo);

            // Limit to requested amount
            messagesToDelete = messagesToDelete.first(amount);

            if (!messagesToDelete.length) {
                return interaction.editReply({
                    content: '⚠️ No messages found to delete (all messages are older than 14 days or none exist).',
                    flags: MessageFlags.Ephemeral
                });
            }

            // Convert array back to Collection
            const messagesCollection = new Collection(messagesToDelete.map(msg => [msg.id, msg]));

            // Delete messages
            const deleted = await interaction.channel.bulkDelete(messagesCollection, true);

            // Confirmation embed
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

            const confirmationMessage = await interaction.followUp({ embeds: [embed], flags: 0 });

            // Auto-delete confirmation after 5 seconds
            setTimeout(async () => {
                try { await confirmationMessage.delete().catch(() => {}); }
                catch (err) { console.error(`Confirmation delete error: ${err}`); }
            }, 5000);

        } catch (err) {
            console.error(`Purge error: ${err}`);
            return interaction.editReply({
                content: '❌ Error deleting messages. (Messages older than 14 days cannot be deleted.)',
                flags: MessageFlags.Ephemeral,
            });
        }
    },
};
