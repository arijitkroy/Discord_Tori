const { SlashCommandBuilder } = require('discord.js');
const os = require('os');

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}h ${m}m ${s}s`;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Displays system details of the bot'),
    async execute(interaction) {
        const processUptime = process.uptime();
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const cpuInfo = os.cpus()[0].model;
        const cpuCount = os.cpus().length;
        const platform = os.platform();
        const arch = os.arch();
        const nodeVersion = process.version;

        const embed = {
        color: 0x00ff00,
        title: 'System Details',
        fields: [
            { name: 'Platform', value: `${platform} (${arch})`, inline: true },
            { name: 'Node.js Version', value: nodeVersion, inline: true },
            { name: 'Process Uptime', value: `${formatTime(processUptime)}`, inline: true },
            { name: 'CPU', value: `${cpuInfo} (${cpuCount} cores)`, inline: false },
            { 
            name: 'Memory', 
            value: `Total: ${(totalMem / 1024 / 1024/ 1024).toFixed(2)} GB\nFree: ${(freeMem / 1024 / 1024 / 1024).toFixed(2)} GB`,
            inline: false 
            }
        ],
        timestamp: new Date()
        };
        await interaction.reply({ embeds: [embed] });
    },
};