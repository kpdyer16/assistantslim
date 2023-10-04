const { SlashCommandBuilder } = require('discord.js');
const { DiceRoll } = require('@dice-roller/rpg-dice-roller');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('roll-stats')
		.setDescription('Roll for the stats of a new character'),
	async execute(interaction) {
    const rollString = '{4d5}kh3';
    let stats = [];
    for (let i = 0; i < 6; i +=1) {
      let roll = new DiceRoll(rollString);
      stats.push(roll.total);
    }

		await interaction.reply(`Your new character's stats are: \`\`\`${stats}\`\`\``);
	},
  global: true,
};