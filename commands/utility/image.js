const { SlashCommandBuilder, EmbedBuilder, Colors, AttachmentBuilder } = require("discord.js");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
const aiModel = genAI.getGenerativeModel({
    model: "gemini-3.6-flash",
    systemInstruction: "You are a multi-purpose AI assistant operating in Discord and hence will generate and format outputs accordingly. Do not generate response in Latex format or any other unsupported formatting of Discord."
});

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
        await interaction.deferReply();
        const prompt = interaction.options.getString('prompt');
        const result = await aiModel.generateContent({
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            text: `Answer in only 1 or 0 whether the given prompt (check strictly) string contains nsfw words (or any form of sexual terms) or not: ${prompt}`,
                        }
                    ],
                }
            ]
        });
        try {
            const responseText = result.response.text().trim();
            if (responseText === '1') return await interaction.editReply("Cannot generate NSFW content!");

            const seed = Math.floor(Math.random() * 1_000_000);
            const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=flux&width=1024&height=1024&nologo=true&seed=${seed}`;
            const response = await fetch(imageUrl);

            if (!response.ok) {
                console.error('Pollinations API response error:', response.statusText);
                return await interaction.editReply("Error generating image. Please try again later.");
            }

            const imageBuffer = Buffer.from(await response.arrayBuffer());
            const attachment = new AttachmentBuilder(imageBuffer, { name: 'generated.jpg' });
            const embed = new EmbedBuilder()
                .setTitle('AI Generated Image')
                .setDescription(`**Prompt:** ${prompt}`)
                .setImage('attachment://generated.jpg')
                .setFooter({ text: "Generated using FLUX.1 (Pollinations AI)" })
                .setColor(Colors.Blurple);
            await interaction.editReply({ embeds: [embed], files: [attachment] });

        } catch (error) {
            console.log(error);
            await interaction.editReply("There was an error generating the image. Please try again later");
        }
    }
}