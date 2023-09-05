const { EmbedBuilder } = require("discord.js");
const Stocks = require("../../../../structs/Stocks.js");

module.exports = {
  name: "relist",
  run: async (client, interaction) => {
    const stock = new Stocks();
    const ticker = interaction.options.getString("ticker");

    await stock.relist(ticker);

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