const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    cooldown: 3,
    syntax: '/links',
    data: new SlashCommandBuilder()
        .setName("links")
        .setDescription("Provides useful links for TORI"),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('Links')
            .setColor('Blurple')
            .setAuthor("TORI")
            .setThumbnail()
            .setFields(
                { name: 'Vote', value: 'https://top.gg/bot/1132538384875798631/vote' },
                { name: 'Invite', value: 'https://discord.com/api/oauth2/authorize?client_id=1132538384875798631&permissions=2147604480&scope=bot%20applications.commands' },
                { name: 'Website', value: 'https://discord-tori.onrender.com' }
            )
            .setTimestamp(new Date.now())
        interaction.reply({ embeds: [embed] });
    }
}