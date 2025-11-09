const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const { EMBED_COLORS } = require('../../functions/global/global-vars');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Shows a multi-page help menu')
    .addIntegerOption(option =>
      option
        .setName('page')
        .setDescription('Page number to view')
        .setRequired(false)
        .setMinValue(1)
    ),

  async execute(interaction) {
    const EMBED_TITLE = 'Help Menu - LegoBotV2';

    // Page 1
    const pages = [
      new EmbedBuilder()
        .setTitle(EMBED_TITLE)
        .setColor(EMBED_COLORS.NORMAL)
        .addFields(
          {
            name: '**Information Commands:**',
            value: [
              '• **/help** - *displays commands*',
              '• **/user info** - *info of a user*',
              '• **/server info** - *info of a server*',
              '• **/bot info** - *info of the bot*',
              '• **/avatar** - *avatar of a user*',
              '• **/ping** - *ping of the bot*'
            ].join('\n')
          },
          {
            name: '**\nUtility Commands:**',
            value: [
              '• **/afk** - *go afk*',
              '• **/get id** - *gets id of a user*'
            ].join('\n')
          }
        ),

      // Page 2
      new EmbedBuilder()
        .setTitle(EMBED_TITLE)
        .setColor(EMBED_COLORS.NORMAL)
        .addFields(
          {
            name: '**Moderation Commands:**',
            value: [
              '• **/ban** - *bans a user*',
              '• **/un-ban** - *un-bans a user*',
              '• **/kick** - *kicks a user*',
              '• **/timeout** - *times out a user*',
              '• **/un-timeout** - *un-times out a user*'
            ].join('\n')
          },
          {
            name: '**\nModeration Commands (extended):**',
            value: [
              '• **/echo** - *echos a message*',
              '• **/set-nick** - *sets nickname of a user*',
              '• **/purge** - *deletes many messages*',
              '• **/add-role** - *assigns a role to a user*',
              '• **/remove-role** - *removes a role from a user*',
              '• **/remove-afk** - *removes an afk status from a user*'
            ].join('\n')
          }
        ),

      // Page 3
      new EmbedBuilder()
        .setTitle(EMBED_TITLE)
        .setColor(EMBED_COLORS.NORMAL)
        .addFields(
          {
            name: '**Logging Commands:**',
            value: [
              '• **/set-log-channel** - *sets a log channel*',
              '• **/remove-log-channel** - *removes a log channel*',
              '• **/set-welcome-channel** - *sets a welcome channel*',
              '• **/remove-welcome-channel** - *removes a welcome channel*',
              '• **/view-log-channel** - *views the welcome channel*',
              '• **/view-welcome-channel** - *views the welcome channel*',
            ].join('\n')
          },
          {
            name: '**\nTrigger Commands:**',
            value: [
              '• **/add trigger** - *adds a trigger*',
              '• **/remove trigger** - *removes a trigger*',
              '• **/list triggers** - *lists all triggers*',
              '• **/clear triggers** - *removes every trigger*'
            ].join('\n')
          }
        ),
    ];

    pages.forEach((p, idx) =>
      p.setFooter({ text: `Page ${idx + 1} / ${pages.length}` })
    );

    let page = interaction.options.getInteger('page') || 1;
    page = Math.max(1, Math.min(page, pages.length)) - 1;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('prev').setLabel('◀️ Previous').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('next').setLabel('Next ▶️').setStyle(ButtonStyle.Primary)
    );

    await interaction.reply({ embeds: [pages[page]], components: [row], flags: MessageFlags.Ephemeral});
    const msg = await interaction.fetchReply();

    const filter = i => i.user.id === interaction.user.id;
    const collector = msg.createMessageComponentCollector({ filter, time: 120000 });

    collector.on('collect', async i => {
      await i.deferUpdate();
      if (i.customId === 'prev') page = page > 0 ? page - 1 : pages.length - 1;
      else if (i.customId === 'next') page = page < pages.length - 1 ? page + 1 : 0;
      await i.editReply({ embeds: [pages[page]] });
    });

    collector.on('end', async () => {
      const disabledRow = new ActionRowBuilder().addComponents(
        row.components.map(btn => btn.setDisabled(true))
      );
      await interaction.editReply({ components: [disabledRow] });
    });
  },
};