const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const { EMBED_COLORS } = require('../../functions/global/global-vars');
const { getTriggers } = require('../../command-handlers/triggers/save-triggers');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('list-triggers')
        .setDescription('Lists all triggers in this server.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        await interaction.deferReply();

        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) { return interaction.editReply(
            {content: '❌ You do not have permission to manage this server.',flags: MessageFlags.Ephemeral});}

        const guildTriggers = getTriggers(interaction.guild.id);
        const triggerKeys = Object.keys(guildTriggers);

        if (triggerKeys.length === 0) {
            return interaction.editReply({
                content: '⚠️ There are no triggers set for this server.',
                flags: MessageFlags.Ephemeral
            });
        }

        // Create the embed
        const embed = new EmbedBuilder()
            .setTitle(`📋 Triggers for ${interaction.guild.name}`)
            .setColor(EMBED_COLORS?.Good || '#57F287')
            .setFooter({
                text: `Requested by ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
            })
            .setTimestamp();

        // If there are too many triggers, split into multiple fields or truncate
        let description = triggerKeys.map(t => `• \`${t}\` → ${guildTriggers[t]}`).join('\n');

        if (description.length > 4000) { description = description.substring(0, 3990) + '\n…';}

        embed.setDescription(description);

        await interaction.editReply({ embeds: [embed]});
    }
};
