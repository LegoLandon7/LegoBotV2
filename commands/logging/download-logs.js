const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('download-logs')
        .setDescription('Download all logs for this server as a ZIP file.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {return interaction.editReply(
                {content: '❌ You do not have permission to manage the server.',flags: MessageFlags.Ephemeral}); }

        const guildId = interaction.guild.id;
        const logsDir = path.join(__dirname, '../../data/logging', guildId);

        if (!fs.existsSync(logsDir)) {return interaction.editReply(
                {content: '⚠️ No logs are available for this server.',flags: MessageFlags.Ephemeral});}

        const tempDir = path.join(__dirname, '../../temp');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

        const zipPath = path.join(tempDir, `${guildId}-logs.zip`);
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', async () => {
            try {
                // Send ZIP file
                await interaction.editReply({ content: '✅ Logs zipped! Sending now...', flags: MessageFlags.Ephemeral});
                await interaction.followUp({ files: [zipPath], flags: MessageFlags.Ephemeral });

                // Delete temp zip
                fs.unlink(zipPath, err => {if (err) console.error(`Failed to delete temp zip: ${err}`);});
            } catch (err) {
                console.error(err);
                await interaction.editReply(
                    {content: '❌ Failed to send logs. please contact cc_landonlego if you need these logs urgently',flags: MessageFlags.Ephemeral});
            }
        });

        archive.on('error', async (err) => {
            console.error(err);
            await interaction.editReply({
                content: '❌ Failed to create ZIP.',
                flags: MessageFlags.Ephemeral
            });
        });

        archive.pipe(output);

        // Dynamically add all files in the guild's log folder
        const logFiles = fs.readdirSync(logsDir);
        if (logFiles.length === 0) {
            return interaction.editReply({
                content: '⚠️ No log files found for this server.',
                flags: MessageFlags.Ephemeral
            });
        }

        logFiles.forEach(file => {
            const filePath = path.join(logsDir, file);
            archive.file(filePath, { name: file });
        });

        archive.finalize();
    },
};