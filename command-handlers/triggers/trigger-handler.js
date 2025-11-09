const { getTriggers } = require('./save-triggers');

function triggerHandler(client) {
    client.on('messageCreate', async (message) => {
        // ignore
        if (!message.guild || message.author.bot) return;

        try {
            const guildId = message.guild.id;
            const triggers = getTriggers(guildId);
            const content = message.content.toLowerCase();

            for (const [trigger, response] of Object.entries(triggers)) {
                if (content.includes(trigger.toLowerCase())) {await message.channel.send(response).catch(() => {});break;}
            }
        } catch (err) {
            console.error(`Trigger handler error: ${err}`);
        }
    });
}

module.exports = { triggerHandler };
