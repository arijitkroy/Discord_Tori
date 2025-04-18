const { SlashCommandBuilder, EmbedBuilder, Colors, AttachmentBuilder } = require("discord.js");
const file = new AttachmentBuilder("./frontend/nsfw.jpg");

module.exports = {
    syntax: '/meme [subreddit]',
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName("meme")
        .setDescription("View random memes from Reddit")
        .addStringOption(option =>
            option
                .setName('subreddit')
                .setDescription('Enter valid sub-reddit')
                .setRequired(false)),
    async execute(interaction) {
        const subreddit = interaction.options.getString("subreddit");
        const url = subreddit ? `https://meme-api.com/gimme/${subreddit}` : "https://meme-api.com/gimme";

        const data = await fetch(url, {
            headers: { "Content-Type": "application/json" }
        })
        .then(res => res.json());

        let title = data.title;
        let author = `Author: ${data.author}`;
        let post_url = data.postLink;
        let nsfw = data.nsfw ? data.nsfw : false;
        let preview = data.preview && nsfw === false ? data.preview[data.preview.length - 1] : "attachment://nsfw.jpg";
        let footer = `${data.subreddit ? "Subreddit: " + data.subreddit + " |" : ""} ${data.ups ? "Up Votes: " + data.ups : ""}`;

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setAuthor({ name: author ? author : "" })
            .setColor(Colors.Blurple)
            .setURL(post_url ? post_url : "")
            .setImage(preview)
            .setFooter({ text: footer });
        nsfw === true ? interaction.reply({ embeds: [embed], files: [file] }) : interaction.reply({ embeds: [embed] });
    }
}
