const { SlashCommandBuilder } = require("discord.js");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: "You are a multi-purpose AI assistant operating in Discord and hence will generate and format outputs accordingly. Do not generate response in Latex format or any other unsupported formatting of Discord."
});

module.exports = {
    syntax: '/chat <prompt> [temperature]',
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('chat')
        .setDescription("Generate response for your prompt (with or without a provided randomness)")
        .addStringOption(option =>
            option
                .setName('prompt')
                .setDescription('Enter anything')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('temperature')
                .setDescription('Randomness of response (0 to 2)')
                .setRequired(false)),
    async execute(interaction) {
        const prompt = interaction.options.getString('prompt');
        let temperature = interaction.options.getString('temperature') || 0.1;
        if (temperature > 2) temperature = 2;
        if (temperature < 0) temperature = 0;
        try {
            const result = await model.generateContentStream({
                contents: [
                    {
                        role: 'user',
                        parts: [
                            {
                                text: prompt,
                            }
                        ],
                    }
                ],
                generationConfig: {
                    maxOutputTokens: 8000,
                    temperature: temperature,
                }
            });

            let fullResponse = "";
            await interaction.reply("TORI is thinking...");
            let firstReply = true;
            let followUpMessageIds = [];

            for await (const chunk of result.stream) {
                const chunkText = chunk.text();
                fullResponse += chunkText;

                if (fullResponse.length > 2000) {
                    let page = fullResponse.substring(0, 2000);
                    fullResponse = fullResponse.substring(2000);

                    if (firstReply) {
                        await interaction.editReply(page);
                        firstReply = false;
                    } else {
                        const followUpMessage = await interaction.followUp(page);
                        followUpMessageIds.push(followUpMessage.id);
                    }
                }
            }

            if (fullResponse.length > 0) {
                if (firstReply) {
                    await interaction.editReply(fullResponse);
                } else {
                    const followUpMessage = await interaction.followUp(fullResponse);
                    followUpMessageIds.push(followUpMessage.id);
                }
            }
        } catch (error) {
            console.error("Gemini API Error:", error);
            await interaction.editReply("An error occurred while processing your request.");
        }
    }
};
