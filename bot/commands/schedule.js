const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { DateTime } = require('luxon');

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
      .setDescription('comma separated dates and times, (format is dayoftheweek mm/dd hh:mm est, ...)')
      .setRequired(true)),
    // .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
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
      const normalized = normalizeDates(date);
      if (normalized.error) {
        await interaction.followUp({ content: normalized.error, ephemeral: true });
      }
      const message = await channel.send(normalized.message);
      await message.react('👍');
      await message.react('👎');
    });

    await scheduleMsg.delete();
	},
};


function normalizeDates(dateString) {
  let dateStringLC = dateString.toLowerCase();

  let dayOfTheWeekMatches = dateStringLC.match(/(?:sun|mon|tue|wed|thu|fri|sat)day/); // monday, tuesday
  let dateMatches = dateStringLC.match(/\d{1,2}\/\d{1,2}/); // example: 08/24, 8/24, 6/5, 6/05
  let timeMatches = dateStringLC.match(/\d{1,2}:\d{2}(?:pm)?|\b\dpm/); // example: 3:24pm, 3:24, 03:24pm
  let timezoneMatches = dateStringLC.match(/pst|mst|cst|est/); // example: pst, mst, cst, est

  if (dateMatches === null) {
    return { error: `Error: Unable to parse date. You wrote "${dateString}"`, message: dateString }; 
  }  
  // process date
  const [month, day] = splitDate(dateMatches[0]);
  
  if (timeMatches === null) {
    // throw error
    return { error: `Error: Unable to parse time. You wrote "${dateString}"`, message: dateString };
  }
  // process time
  const time = timeMatches[0] + (timeMatches[0].slice(-2) === 'pm' ? '' : 'pm'); // add pm if omitted
  const [hour, minute] = parseTime(time);
  const timezone = timezoneMatches ? timezoneMatches[0] : 'est';
  // const dayOfTheWeek = dayOfTheWeekMatches ? dayOfTheWeekMatches[0][0].toUpperCase() + dayOfTheWeekMatches[0].slice(1) : ''; // I want to eventually infer the day of the week when omitted

  return { message: generateDateString(month,day,hour,minute,time,timezone) };
}

function splitDate(date) {
  return [month, day] = date.split('/').map((str) => Number(str));
}

function parseTime(time) {
  // assumed to be pm
  const intermediaryTimeValues = time.slice(0,-2).split(':')
  const hour = (Number(intermediaryTimeValues[0]) % 12) + 12;
  if (intermediaryTimeValues.length < 2) {
    return [hour, 0];
  }

  // get both numbers
  const minute = intermediaryTimeValues[1];
  return [hour,minute];
}

function generateDateString(month,day,hour,minute,time,timezone) {
  const weekdays = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  let date = DateTime.fromObject({ month: month, day: day, hour: hour, minute: minute });
  let optionalYearString = '';
  if (date < DateTime.now()) {
    const year = date.year;
    date = date.set({ year: year+1 });
    optionalYearString = date.year+1;
  }

  const weekday = weekdays[date.weekday-1];

  return `${weekday} ${month}/${day} ${optionalYearString} ${time} ${timezone}`
}