const { ActivityType } = require('discord.js');

function setPresence(client) {
        client.user.setPresence({
        activities: [{ name: '/help for commands', type: ActivityType.Playing }], 
        status: 'online',
    });

    const activity = client.user.presence.activities[0];
    const status = client.user.presence.status;

    const activityNames = { 0: 'Playing', 1: 'Streaming', 2: 'Listening to', 3: 'Watching', 5: 'Competing in'};

    console.log(`🎮 Presence set as: ${activityNames[activity.type]} ${activity.name}`);
    console.log(`🎮 Status set as: ${status}`);
}

module.exports = { setPresence };