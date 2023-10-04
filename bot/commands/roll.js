const { SlashCommandBuilder } = require('discord.js');
const { DiceRoll } = require('@dice-roller/rpg-dice-roller');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('roll')
		.setDescription('Roll your dice!')
    .addStringOption(option => 
      option.setName('input')
        .setDescription('Dice notation e.g. 5d6')
        .setRequired(true)),
	async execute(interaction) {
    const rollMessage = interaction.options.getString('input');
    const roll = new DiceRoll(rollMessage);
    console.log(roll.output);
		await interaction.reply(`You rolled \`\`\`${roll.output}\`\`\``);
	},
  global: true,
};