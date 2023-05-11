const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('schedule')
		.setDescription('Write comma separated dates, and I will do the rest')
    .addStringOption(option => 
      option.setName('msg')
      .setDescription('an intro message before providing the schedule options')
      .setRequired(true))
    .addStringOption(option => 
      option.setName('dates')
      .setDescription('comma separated dates and times, e.g. 1/25 5pm est, ...')
      .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
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
      const message = await channel.send(date);
      await message.react('👍');
      await message.react('👎');
    });

    await scheduleMsg.delete();
	},
};