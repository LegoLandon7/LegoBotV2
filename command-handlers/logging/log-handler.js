const { EmbedBuilder } = require('discord.js');
const { logEvent } = require("./log-events.js");
const { formatDuration } = require("../../functions/formatting/format-duration.js");
const { EMBED_COLORS } = require("../../functions/global/global-vars.js");
const { getLogChannel, getWelcomeChannel } = require("./save-log-channels.js");

function createEmbed(title, color, content, user) {
    const embed = new EmbedBuilder()
        .setTitle(title)
        .setColor(color)
        .setDescription(content)
        .setTimestamp();

    if (user) {embed.setThumbnail(user.displayAvatarURL({ dynamic: true }))}

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

        const timestamp = new Date(newMessage.createdTimestamp).toLocaleString();
        const log = `[${timestamp}] (${newMessage.author.tag} | ${newMessage.author.id}) (#${newMessage.channel.name})\n\tOLD: "${oldMessage.content || "[NONE]"}"\n\tNEW: "${newMessage.content || "[NONE]"}"` +
                (newMessage.attachments.size ? `\n\tATTACHMENTS: ${newMessage.attachments.map(a => a.name || a.url).join(', ')}` : '');

        logEvent(newMessage.guild.id, "message-updates.txt", log);
        sendLog(newMessage.guild, createEmbed("Message Updated", EMBED_COLORS.MEDIUM, [
            `• **User:** ${newMessage.author.tag} (\`${newMessage.author.id}\`)`,
            `• **Channel:** ${newMessage.channel}`,
            `• **New:** ${newMessage.content || "[NONE]"}`,
             `• **Old:** ${oldMessage.content || "[NONE]"}`,
            (newMessage.attachments.size ? `• **Attachments:** ${newMessage.attachments.map(a => a.name || a.url).join(', ')}` : '')
            ].join('\n'), newMessage.author));
        });

    // Message Deleted
    client.on("messageDelete", (message) => {
        const timestamp = new Date(message.createdTimestamp).toLocaleString();
        const log = `[${timestamp}] (${message.author.tag} | ${message.author.id}) (#${message.channel.name})\n\tDELETED: "${message.content || "[NONE]"}"` +
            (message.attachments.size ? `\n\tATTACHMENTS: ${message.attachments.map(a => a.name || a.url).join(', ')}` : '');

        logEvent(message.guild.id, "message-removed.txt", log);
        sendLog(message.guild, createEmbed("Message Removed", EMBED_COLORS.BAD, [
            `• **User:** ${message.author.tag} (\`${message.author.id}\`)`,
            `• **Channel:** ${message.channel}`,
            `• **Message:** ${message.content || "[NONE]"}`,
            (message.attachments.size ? `• **Attachments:** ${message.attachments.map(a => a.name || a.url).join(', ')}` : '')
            ].join('\n'), message.author));
        });

    client.on("guildMemberUpdate", (oldMember, newMember) => {
        const timestamp = new Date().toLocaleString();

        // Avatar Updated
        if (oldMember.user.avatar !== newMember.user.avatar) {
            const log = `[${timestamp}] (${newMember.user.tag} | ${newMember.id})\n\t${newMember.user.displayAvatarURL()}`;

            logEvent(newMember.guild.id, "member-avatar-updates.txt", log);
            sendLog(newMember.guild, createEmbed("Avatar Updated", EMBED_COLORS.MEDIUM, [
                `• **User:** ${newMember.user.tag} (\`${newMember.user.id}\`)`,
                ].join('\n'), newMember.user));
        }

        // Role Updated
        const oldRoles = oldMember.roles.cache.map(r => r.name).sort();
        const newRoles = newMember.roles.cache.map(r => r.name).sort();

        const addedRoles = newRoles.filter(id => !oldRoles.includes(id));
        const removedRoles = oldRoles.filter(id => !newRoles.includes(id));

        if (addedRoles.length || removedRoles.length) {
            let log = `[${timestamp}] (${newMember.user.tag} | ${newMember.id}) `;
            if (addedRoles.length) log += `\n\tADDED ROLES: ${addedRoles.join(", ")}`
            if (removedRoles.length) log += `\n\tREMOVED ROLES: ${removedRoles.join(", ")}`

            logEvent(newMember.guild.id, "member-role-updates.txt", log);
            sendLog(newMember.guild, createEmbed("Roles Updated", EMBED_COLORS.MEDIUM, [
                `• **User:** ${newMember.user.tag} (\`${newMember.user.id}\`)`,
                `• **Added Roles:** ${addedRoles.join(", ") || "[NONE]"}`,
                `• **Removed Roles:** ${removedRoles.join(", ") || "[NONE]"}`,
                ].join('\n'), newMember.user));
        }

        // Nickname Updated
        const oldNick = oldMember.nickname || oldMember.user.username;
        const newNick = newMember.nickname || newMember.user.username;

        if (oldNick !== newNick) {
            const log = `[${timestamp}] (${newMember.user.tag} | ${newMember.id})\n\tOLD: "${oldNick}"\n\tNEW: "${newNick}"`;
            logEvent(newMember.guild.id, "member-nicknames.txt", log);
            sendLog(newMember.guild, createEmbed("Nickname Updated", EMBED_COLORS.MEDIUM, [
                `• **User:** ${newMember.user.tag} (\`${newMember.user.id}\`)`,
                `• **New Nickname:** ${newNick || "[NONE]"}`,
                `• **Old Nickname:** ${oldNick || "[NONE]"}`,
                ].join('\n'), newMember.user));
        }

        // Member Timeouts
        const oldTimeout = oldMember.communicationDisabledUntilTimestamp;
        const newTimeout = newMember.communicationDisabledUntilTimestamp;

        if (oldTimeout !== newTimeout) {
            if (newTimeout && newTimeout > Date.now()) {
                // Timeout applied
                const duration = newTimeout - Date.now();
                const log = `[${timestamp}] (${newMember.user.tag} | ${newMember.id}) TIMEOUT APPLIED -> ${formatDuration(duration)}`;
                logEvent(newMember.guild.id, "member-timeouts.txt", log);
                sendLog(newMember.guild, createEmbed("Timeout Added", EMBED_COLORS.BAD, [
                    `• **User:** ${newMember.user.tag} (\`${newMember.user.id}\`)`,
                    `• **Time:** ${formatDuration(duration)}`,
                    ].join('\n'), newMember.user));
            } else if (!newTimeout || newTimeout <= Date.now()) {
                // Timeout removed
                const log = `[${timestamp}] (${newMember.user.tag} | ${newMember.id}) TIMEOUT REMOVED`;
                logEvent(newMember.guild.id, "member-timeouts.txt", log);
                sendLog(newMember.guild, createEmbed("Timeout Removed", EMBED_COLORS.GOOD, [
                    `• **User:** ${newMember.user.tag} (\`${newMember.user.id}\`)`,
                    ].join('\n'), newMember.user));
            }
        }
    });

    // Member Join
    client.on("guildMemberAdd", (member) => {
        const timestamp = new Date().toLocaleString();
        const log = `[${timestamp}] (${member.user.tag} | ${member.user.id}) MEMBER JOINED`;

        logEvent(member.guild.id, "member-joins-leaves.txt", log);
        sendLog(member.guild, createEmbed("Member Joined", EMBED_COLORS.GOOD, [
            `• **User:** ${member.user.tag} (\`${member.user.id}\`)`,
            `• **Account Created:** ${new Date(member.user.createdTimestamp).toLocaleString()}`,
            ].join('\n'), member.user));
        sendWelcome(member.guild, createEmbed("Member Joined", EMBED_COLORS.GOOD, [
            `• **User:** ${member}`,
            `• **Joined Server:** ${new Date(member.joinedTimestamp).toLocaleString()}`,
            ].join('\n'), member.user));
    });

    // Member Leave
    client.on("guildMemberRemove", (member) => {
        const timestamp = new Date().toLocaleString();
        const log = `[${timestamp}] (${member.user.tag} | ${member.user.id}) MEMBER LEFT`;

        logEvent(member.guild.id, "member-joins-leaves.txt", log);
        sendLog(member.guild, createEmbed("Member Left", EMBED_COLORS.BAD, [
            `• **User:** ${member.user.tag} (\`${member.user.id}\`)`,
            `• **Account Created:** ${new Date(member.user.createdTimestamp).toLocaleString()}`,
            ].join('\n'), member.user));
        sendWelcome(member.guild, createEmbed("Member Left", EMBED_COLORS.BAD, [
            `• **User:** ${member}`,
            `• **Joined Server:** ${new Date(member.joinedTimestamp).toLocaleString()}`,
            ].join('\n'), member.user));
    });

    // Bulk Delete
    client.on("messageDeleteBulk", (messages) => {
        if (messages.size === 0) return;

        const logLines = messages.map(msg => {
            const timestamp = new Date(msg.createdTimestamp).toLocaleString();
            return `\t[${timestamp}] (${msg.author.tag} | ${msg.author.id}) (#${msg.channel.name}) "${msg.content}"` +
                (msg.attachments.size ? `\n\tATTACHMENTS: ${msg.attachments.map(a => a.name || a.url).join(', ')}` : '');
        }).filter(Boolean);

        if (logLines.length === 0) return;
        let logMessages = logLines.join("\n");

        const log = `${logLines.length} messages purged: \n${logMessages}`
        if (!messages.first()) return;
        logEvent(messages.first().guild.id, "message-purged.txt", log);
        sendLog(messages.first().guild, createEmbed("Messages Purged", EMBED_COLORS.BAD, [
            `• **Amount:** ${logLines.length}`,
            `• **Channel:** ${messages.first().channel}`,
            `• use /download-logs to view purged messages`,
            ].join('\n'), null));
    });

    // Ban Member
    client.on("guildBanAdd", (ban) => {
        const timestamp = new Date().toLocaleString();
        const log = `[${timestamp}] (${ban.user.tag} | ${ban.user.id}) MEMBER BANNED`;
        logEvent(ban.guild.id, "member-bans.txt", log);
        sendLog(ban.guild, createEmbed("User Banned", EMBED_COLORS.BAD, [
            `• **User:** ${ban.user.tag} (\`${ban.user.id}\`)`,
            `• **Reason:** ${ban.reason || "[NONE]"}`,
            ].join('\n'), ban.user));
    });

    // Unban Member
    client.on("guildBanRemove", (ban) => {
        const timestamp = new Date().toLocaleString();
        const log = `[${timestamp}] (${ban.user.tag} | ${ban.user.id}) MEMBER UNBANNED`;
        logEvent(ban.guild.id, "member-bans.txt", log);
        sendLog(ban.guild, createEmbed("User Un-banned", EMBED_COLORS.GOOD, [
            `• **User:** ${ban.user.tag} (\`${ban.user.id}\`)`,
            ].join('\n'), ban.user));
    });
}

module.exports = {loggingHandler};