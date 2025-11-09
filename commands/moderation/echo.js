const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const { EMBED_COLORS } = require('../../functions/global/global-vars');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('echo')
        .setDescription('Echos a message')
        .addChannelOption(option =>
            option.setName('target_channel')
                .setDescription('The channel to echo to')
                .setRequired(true)
        )
        .addStringOption(option => 
            option
                .setName('message')
                .setDescription('The message to echo')
                .setRequired(true)
        ).setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const channel = interaction.options.getChannel('target_channel') || interaction.channel;
        const message = interaction.options.getString('message');

        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {return interaction.editReply(
            {content: '❌ You do not have permission to manage guild.', flags: MessageFlags.Ephemeral});}

        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageGuild)) {return interaction.editReply(
            {content: '❌ I do not have permission to manage guild.', flags: MessageFlags.Ephemeral});}

        if (!channel.viewable) {return interaction.editReply({
            content: '❌ I am unable to view this channel.'})}

        if (!channel.permissionsFor(channel.guild.members.me).has((PermissionFlagsBits.SendMessages))) {return interaction.editReply({
            content: '❌ I am unable to send messages in this channel.' })}

        if (!channel.permissionsFor(interaction.user).has((PermissionFlagsBits.ViewChannel))) {return interaction.editReply({
            content: '❌ You are unable to view this channel.'})}

        if (!channel.permissionsFor(interaction.user).has((PermissionFlagsBits.SendMessages))) {return interaction.editReply({
            content: '❌ You are unable to send messages in this channel.' })}

            try {
                await channel.send({ content: message });

                const embed = new EmbedBuilder()
                    .setTitle("💬 Echo Sent")
                    .setColor(EMBED_COLORS.GOOD)
                    .setDescription([
                        `• **Channel:** ${channel}`,
                        `• **Message:** ${message}`,
                    ].join('\n'))
                    .setFooter({
                        text: `Echo sent by ${interaction.user.tag}`,
                        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
                    }).setTimestamp();


                await interaction.editReply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            } catch(err) {
                console.error(`echo error: ${err}`)
                await interaction.editReply({ content: '❌ Failed to send message.', flags: MessageFlags.Ephemeral });
            }
    }
};