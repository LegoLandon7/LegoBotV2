const { SlashCommandBuilder, EmbedBuilder, MessageFlags, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { EMBED_COLORS } = require('../../utility/global/global-vars');

const filePath = path.join(__dirname, '../../data/utility/afk-users.json');

function readAfkData() {
    try {
        const raw = fs.readFileSync(filePath, 'utf8').trim();
        if (!raw) return {};
        return JSON.parse(raw);
    } catch (err) {
        console.error("Failed to read afk-users.json, resetting file.", err);
        fs.writeFileSync(filePath, '{}');
        return {};
    }
}

function writeAfkData(data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove-afk')
        .setDescription('Removes a users AFK status')
        .addUserOption(option =>
            option.setName('target_user')
                .setDescription('The user to remove the AFK status from')
                .setRequired(true)
        ).setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        await interaction.deferReply({flags: MessageFlags.Ephemeral});

        const target = interaction.options.getUser('target_user') || interaction.user;
        const afkData = readAfkData();

        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {return interaction.editReply(
            {content: '❌ You do not have permission to manage messages.', flags: MessageFlags.Ephemeral});}

        if (!afkData[target.id]) { return interaction.editReply(
            {content: `⚠️ ${target.tag} is not currently AFK.`,flags: MessageFlags.Ephemeral });}

        delete afkData[target.id];
        writeAfkData(afkData);

        try {await target.send(`Your AFK status was removed by a moderator in ${interaction.guild.name}.`)}
        catch(err){console.error(`DM error: ${err}`)};

        const embed = new EmbedBuilder()
            .setColor(EMBED_COLORS.BAD)
            .setTitle('🔨 AFK Status Removed')
            .setDescription([
                `• **User:** ${target.tag} (\`${target.id}\`)`,
            ].join('\n'))
            .setFooter({
                text: `Removed by ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
            }).setTimestamp();

        await interaction.editReply({ embeds: [embed]});
    }
};