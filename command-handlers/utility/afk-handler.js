const fs = require('fs');
const path = require('path');
const { formatDuration } = require('../../utility/formatting/format-duration.js');
const { MessageFlags } = require('discord.js');

const filePath = path.join(__dirname, '../../data/utility/afk-users.json');

function readAfkData() {
    if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '{}');
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}
function writeAfkData(data) { fs.writeFileSync(filePath, JSON.stringify(data, null, 2));}

module.exports = async (message) => {
    if (message.author.bot) return;

    const afkData = readAfkData();
    const authorId = message.author.id;

    // Remove AFK when user sends a message
    if (afkData[authorId]) {
        delete afkData[authorId];
        writeAfkData(afkData);
        const reply = await message.reply(`👋 Welcome back <@${authorId}>, you are no longer AFK.`);
        setTimeout(() => { reply.delete().catch(() => {});}, 5000); // 5 seconds
        return;
    }

    // Check for mentioned AFK users
    for (const mention of message.mentions.users.values()) {
        if (afkData[mention.id]) {
            const { reason, since } = afkData[mention.id];
            
            const afkDuration = Date.now() - since;
            const timeString = formatDuration(afkDuration);

            await message.reply({content: `💤 **${mention.tag}** has been AFK for **${timeString}**\n**Reason**: ${reason}`, flags: MessageFlags.Ephemeral});
        }
    }
};