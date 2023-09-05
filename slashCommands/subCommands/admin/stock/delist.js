const { EmbedBuilder } = require("discord.js");
const Stocks = require("../../../../structs/Stocks.js");

module.exports = {
  name: "delist",
  run: async (client, interaction) => {
    const stock = new Stocks();
    const ticker = interaction.options.getString("ticker");

    await stock.delist(ticker);

    const embed = new EmbedBuilder()
      .setTitle("Success")
      .setDescription(`Successfully delisted \`${ticker}\`.`)
      .setColor("Green")
      .setTimestamp()
      .setFooter({ text: "The Exchange  •  Invest in the future", iconURL: interaction.guild.iconURL() });

    return interaction.reply({
      embeds: [embed]
    });
  }
};