const { EmbedBuilder } = require('discord.js');
const { formatDuration } = require("../../utility/formatting/format-duration.js");
const { EMBED_COLORS } = require("../../utility/global/global-vars.js");
const { getLogChannel, getWelcomeChannel } = require("./save-log-channels.js");

function createEmbed(title, color, content, user) {
    const embed = new EmbedBuilder()
        .setTitle(title)
        .setColor(color)
        .setDescription(content)
        .setTimestamp();

    if (user) {
        embed.setThumbnail(user.displayAvatarURL({ dynamic: true }));
        embed.setFooter({text: `${user.tag} | ${user.id}`})
    }

    return embed;
}

async function sendLog(guild, embed) {
    const channelId = getLogChannel(guild.id); 
    if (!channelId) return;
    const logChannel = await guild.channels.fetch(channelId).catch(() => null); 
    if (!logChannel) return;

    logChannel.send({ embeds: [embed] }).catch(console.error);
}

async function sendWelcome(guild, embed) {
    const channelId = getWelcomeChannel(guild.id); 
    if (!channelId) return;
    const welcomeChannel = await guild.channels.fetch(channelId).catch(() => null); 
    if (!welcomeChannel) return;

    welcomeChannel.send({ embeds: [embed] }).catch(console.error);
}

function loggingHandler(client) {
    // Message Updated
    client.on("messageUpdate", (oldMessage, newMessage) => {
        if (oldMessage.content === newMessage.content) return;

        sendLog(newMessage.guild, createEmbed("Message Updated", EMBED_COLORS.MEDIUM, [
            `• **User:** ${newMessage.author}`,
            `• **Channel:** ${newMessage.channel}`,
            `• **New:** ${newMessage.content || "[NONE]"}`,
             `• **Old:** ${oldMessage.content || "[NONE]"}`,
            (newMessage.attachments.size ? `• **Attachments:** ${newMessage.attachments.map(a => a.name || a.url).join(', ')}` : '')
            ].join('\n'), newMessage.author));
        });

    // Message Deleted
    client.on("messageDelete", (message) => {
        sendLog(message.guild, createEmbed("Message Removed", EMBED_COLORS.BAD, [
            `• **User:** ${message.author}`,
            `• **Channel:** ${message.channel}`,
            `• **Message:** ${message.content || "[NONE]"}`,
            (message.attachments.size ? `• **Attachments:** ${message.attachments.map(a => a.name || a.url).join(', ')}` : '')
            ].join('\n'), message.author));
        });

    client.on("userUpdate", (oldUser, newUser) => {
        // Avatar Updated
        if (oldUser.avatar !== newUser.avatar) {
            sendLog(newMember.guild, createEmbed("Avatar Updated", EMBED_COLORS.MEDIUM, [
                `• **User:** ${oldUser}`,
                ].join('\n'), newUser));
        } 
    });
    client.on("guildMemberUpdate", (oldMember, newMember) => {
        // Role Updated
        const oldRoles = oldMember.roles.cache.map(r => r);
        const newRoles = newMember.roles.cache.map(r => r);

        const addedRoles = newRoles.filter(r => !oldRoles.some(o => o.id === r.id));
        const removedRoles = oldRoles.filter(r => !newRoles.some(n => n.id === r.id));

        if (addedRoles.length || removedRoles.length) {
            sendLog(newMember.guild, createEmbed("Roles Updated", EMBED_COLORS.MEDIUM, [
                `• **User:** ${newMember.user}`,
                `• **Added Roles:** ${addedRoles.map(r => `<@&${r.id}>`).join(", ") || "[NONE]"}`,
                `• **Removed Roles:** ${removedRoles.map(r => `<@&${r.id}>`).join(", ") || "[NONE]"}`,
            ].join("\n"), newMember.user));
        }

        // Member Timeouts
        const oldTimeout = oldMember.communicationDisabledUntilTimestamp;
        const newTimeout = newMember.communicationDisabledUntilTimestamp;

        if (oldTimeout !== newTimeout) {
            if (newTimeout && newTimeout > Date.now()) {
                // Timeout applied
                const duration = newTimeout - Date.now();
                sendLog(newMember.guild, createEmbed("Timeout Added", EMBED_COLORS.BAD, [
                    `• **User:** ${newMember.user}`,
                    `• **Time:** ${formatDuration(duration)}`,
                    `• **Reason:** ${newTimeout.reason}`,
                    ].join('\n'), newMember.user));
            } else if (!newTimeout || newTimeout <= Date.now()) {
                // Timeout removed
                sendLog(newMember.guild, createEmbed("Timeout Removed", EMBED_COLORS.GOOD, [
                    `• **User:** ${newMember.user}`,
                    ].join('\n'), newMember.user));
            }
        }
    });

    // Member Join
    client.on("guildMemberAdd", (member) => {
        sendLog(member.guild, createEmbed("Member Joined", EMBED_COLORS.GOOD, [
            `• **User:** ${member.user}`,
            `• **Account Created:** ${new Date(member.user.createdTimestamp).toLocaleString()}`,
            ].join('\n'), member.user));
        sendWelcome(member.guild, createEmbed("Member Joined", EMBED_COLORS.GOOD, [
            `• **User:** ${member}`,
            `• **Joined Server:** ${new Date(member.joinedTimestamp).toLocaleString()}`,
            ].join('\n'), member.user));
    });

    // Member Leave
    client.on("guildMemberRemove", (member) => {
        sendLog(member.guild, createEmbed("Member Left", EMBED_COLORS.BAD, [
            `• **User:** ${member.user}`,
            `• **Account Created:** ${new Date(member.user.createdTimestamp).toLocaleString()}`,
            ].join('\n'), member.user));
        sendWelcome(member.guild, createEmbed("Member Left", EMBED_COLORS.BAD, [
            `• **User:** ${member}}`,
            `• **Joined Server:** ${new Date(member.joinedTimestamp).toLocaleString()}`,
            ].join('\n'), member.user));
    });

    // Bulk Delete
    client.on("messageDeleteBulk", (messages) => {
        if (messages.size === 0) return;
        
        if (!messages.first()) return;
            sendLog(messages.first().guild, createEmbed("Messages Purged", EMBED_COLORS.BAD, [
                `• **Amount:** ${logLines.length}`,
                `• **Channel:** ${messages.first().channel}`,
                `• use /download-logs to view purged messages`,
                ].join('\n'), null));
    });

    // Ban Member
    client.on("guildBanAdd", (ban) => {
        sendLog(ban.guild, createEmbed("User Banned", EMBED_COLORS.BAD, [
            `• **User:** ${ban.user}`,
            `• **Reason:** ${ban.reason || "[NONE]"}`,
            ].join('\n'), ban.user));
    });

    // Unban Member
    client.on("guildBanRemove", (ban) => {
        
        sendLog(ban.guild, createEmbed("User Un-banned", EMBED_COLORS.GOOD, [
            `• **User:** ${ban.user}`,
            ].join('\n'), ban.user));
    });
}

module.exports = {loggingHandler};