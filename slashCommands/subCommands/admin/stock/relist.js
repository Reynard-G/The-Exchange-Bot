const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "relist",
  run: async (client, interaction) => {
    const ticker = interaction.options.getString("ticker").toUpperCase();

    await client.stocks.relist(ticker);

    const embed = new EmbedBuilder()
      .setTitle("Success")
      .setDescription(`Successfully relisted \`${ticker}\`.`)
      .setColor("Green")
      .setTimestamp()
      .setFooter({ text: "The Exchange  •  Invest in the future", iconURL: interaction.guild.iconURL() });

    return interaction.reply({
      embeds: [embed]
    });
  }
};