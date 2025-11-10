const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const { EMBED_COLORS } = require('../../utility/global/global-vars');
const { addTrigger, removeTrigger, getTriggers } = require('../../command-handlers/triggers/save-triggers');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add-trigger')
        .setDescription('Adds a trigger')
        .addStringOption(option =>
            option.setName('trigger')
                .setDescription('The trigger')
                .setRequired(true)
        )
        .addStringOption(option => 
            option
                .setName('message')
                .setDescription('The message the trigger sends')
                .setRequired(true)
        ).setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const trigger = interaction.options.getString('trigger');
        const message = interaction.options.getString('message');

        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {return interaction.editReply(
            {content: '❌ You do not have permission to manage guild.', flags: MessageFlags.Ephemeral});}

            try {
                addTrigger(interaction.guild.id, trigger, message);

                const embed = new EmbedBuilder()
                    .setTitle('💯 Trigger Made')
                    .setColor(EMBED_COLORS.GOOD)
                    .setDescription([
                        `• **Trigger:** ${trigger}`,
                        `• **Message:** ${message}`,
                    ].join('\n'))
                    .setFooter({
                        text: `Trigger made by ${interaction.user.tag}`,
                        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
                    }).setTimestamp();


                await interaction.editReply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            } catch(err) {
                console.error(`add trigger error: ${err}`)
                await interaction.editReply({ content: '❌ Failed to add trigger.', flags: MessageFlags.Ephemeral });
            }
    }
};