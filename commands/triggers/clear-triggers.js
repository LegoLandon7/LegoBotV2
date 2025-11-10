const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const { EMBED_COLORS } = require('../../utility/global/global-vars');
const { addTrigger, removeTrigger, getTriggers, clearTriggers } = require('../../command-handlers/triggers/save-triggers');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear-triggers')
        .setDescription('Clears all triggers')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {return interaction.editReply(
            {content: '❌ You do not have permission to manage guild.', flags: MessageFlags.Ephemeral});}

            try {
                const success = clearTriggers(interaction.guild.id);
                if (!success) {return interaction.editReply({ content: '⚠️ There were no triggers to clear.', flags: MessageFlags.Ephemeral });}

                const embed = new EmbedBuilder()
                    .setTitle('🔨 Triggers Cleared')
                    .setColor(EMBED_COLORS.BAD)
                    .setFooter({
                        text: `Triggers Cleared by ${interaction.user.tag}`,
                        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
                    }).setTimestamp();

                await interaction.editReply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            } catch(err) {
                console.error(`clear trigger error: ${err}`)
                await interaction.editReply({ content: '❌ Failed to remove trigger.', flags: MessageFlags.Ephemeral });
            }
    }
};