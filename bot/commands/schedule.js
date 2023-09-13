const { SlashCommandBuilder } = require('discord.js');
const parseDate = require('../util/date-util');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('schedule')
		.setDescription('Propose dates for the next session')
    .addStringOption(option => 
      option.setName('msg')
      .setDescription('an intro message before providing the schedule options')
      .setRequired(true))
    .addStringOption(option => 
      option.setName('dates')
      .setDescription('pairs of dates and times (mm/dd hh:mm, mm/dd hh:mm,...)')
      .setRequired(true)),
	async execute(interaction) {
    const introMessage = interaction.options.getString('msg');
    const datesString = interaction.options.getString('dates');
    const dates = datesString.split(',').map(datetime => datetime.trim());
    
    const scheduleMsg = await interaction.reply({content: 'Creating your schedule', ephemeral: true})

    const channel = interaction.channel;
    if (introMessage) {
      await channel.send(introMessage);
    }
    dates.forEach(async date => {
      const parsedDate = parseDate(date);
      if (parsedDate.error) {
        await interaction.followUp({ content: parsedDate.error, ephemeral: true });
      }
      const message = await channel.send(parsedDate.message);
      await message.react('👍');
      await message.react('👎');
    });

    await scheduleMsg.delete();
	},
};
