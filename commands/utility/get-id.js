const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('get-id')
        .setDescription('Gets the id of a user')
        .addUserOption(option => 
            option
                .setName('target_user')
                .setDescription('The user to get the id from')
                .setRequired(false)
        ),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const user = interaction.options.getUser('target_user') || interaction.user;
        await interaction.editReply({ content: `The user ID for **${user.tag}** is: ${'`' + user.id + '`'}` });
    }
};