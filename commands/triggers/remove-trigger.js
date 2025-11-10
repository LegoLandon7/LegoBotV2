const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const { EMBED_COLORS } = require('../../utility/global/global-vars');
const { addTrigger, removeTrigger, getTriggers } = require('../../command-handlers/triggers/save-triggers');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove-trigger')
        .setDescription('Removed a trigger')
        .addStringOption(option =>
            option.setName('trigger')
                .setDescription('The trigger to remove')
                .setRequired(true)
        ).setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const trigger = interaction.options.getString('trigger');

        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {return interaction.editReply(
            {content: '❌ You do not have permission to manage guild.', flags: MessageFlags.Ephemeral});}

            try {
                const triggers = getTriggers(interaction.guild.id);

                if (!triggers[trigger]) {
                    return interaction.editReply({content: `❌ No trigger found with the name **${trigger}**.`,flags: MessageFlags.Ephemeral});}

                removeTrigger(interaction.guild.id, trigger);

                const embed = new EmbedBuilder()
                    .setTitle('🔨 Trigger Removed')
                    .setColor(EMBED_COLORS.BAD)
                    .setDescription([
                        `• **Trigger:** ${trigger}`,
                    ].join('\n'))
                    .setFooter({
                        text: `Trigger removed by ${interaction.user.tag}`,
                        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
                    }).setTimestamp();


                await interaction.editReply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            } catch(err) {
                console.error(`remove trigger error: ${err}`)
                await interaction.editReply({ content: '❌ Failed to remove trigger.', flags: MessageFlags.Ephemeral });
            }
    }
};