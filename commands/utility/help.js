const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');
const fs = require("fs");
const path = require("path");

module.exports = {
    syntax: '/help',
    cooldown: 3,
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Displays list of available commands of the bot'),
    async execute(interaction) {
        let fields_body = [];
        const foldersPath = path.join('./commands');
        const commandFolders = fs.readdirSync(foldersPath);
        for (const folder of commandFolders) {
            const commandsPath = path.join(foldersPath, folder);
            const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));
            for (const file of commandFiles) {
                const command = require(`./${file}`);
                fields_body.push({
                    name: `\`${command.syntax}\``,
                    value: command.data.description
                });
            }
        }
        const embed = new EmbedBuilder({
            color: Colors.Blurple,
            title: 'Commands List',
            fields: fields_body,
            timestamp: new Date(),
            footer: { text: `<> - Required | [] - Optional`}
        });

        await interaction.reply({ embeds: [embed] });
    },
};