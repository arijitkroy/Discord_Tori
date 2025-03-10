const { SlashCommandBuilder, EmbedBuilder, Colors, AttachmentBuilder } = require("discord.js");
const model = "stabilityai/stable-diffusion-3.5-large";

module.exports = {
    cooldown: 5,
    syntax: "/image <prompt>",
    data: new SlashCommandBuilder()
        .setName("image")
        .setDescription("Generate image for the given prompt")
        .addStringOption(option => 
            option
                .setName('prompt')
                .setDescription('Enter anything')
                .setRequired(true)
        ),
    async execute(interaction) {
        const prompt = interaction.options.getString('prompt');
        await interaction.deferReply();
        try {
            const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
                method:'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.HUGGINGFACE_API}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    inputs: prompt,
                    options: { wait_for_model: true }
                })
            })

            if (!response.ok) {
                console.error('Hugging Face API response error:', response.statusText);
                return await interaction.editReply("Error generating image. Please try again later.");
            }

            console.log(response);

            const imageBuffer = Buffer.from(await response.arrayBuffer());
            const attachment = new AttachmentBuilder(imageBuffer, { name: 'generated.png' });
            const embed = new EmbedBuilder()
                .setTitle('AI Generated Image')
                .setDescription(`Prompt: ${prompt}`)
                .setImage('attachment://generated.png')
                .setFooter({ text: "Generated using Stable Diffusion 3.5" })
                .setColor(Colors.Blurple);
            await interaction.editReply({ embeds: [embed], files: [attachment] });

        } catch (error) {
            console.log(error);
            await interaction.reply("There was an error generating the image. Please try again later");
        }
    }
}