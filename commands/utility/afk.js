const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { EMBED_COLORS } = require('../../functions/global/global-vars');

const filePath = path.join(__dirname, '../../data/utility/afk-users.json');

// Ensure file exists
if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '{}');

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
        .setName('afk')
        .setDescription('Set your AFK status')
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('AFK reason')
                .setRequired(false)
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const user = interaction.user;
        const reason = interaction.options.getString('reason') || 'No reason provided';

        const afkData = readAfkData();
        afkData[user.id] = {
            reason,
            since: Date.now()
        };
        writeAfkData(afkData);

        const embed = new EmbedBuilder()
            .setColor(EMBED_COLORS.NORMAL)
            .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
            .setDescription(`💤 You are now marked as AFK.\n**Reason:** ${reason}`)
            .setFooter({ text: 'Your AFK will be removed when you send a message.' })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed]});
    }
};