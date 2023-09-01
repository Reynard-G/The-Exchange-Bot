const { EmbedBuilder } = require("discord.js");
const Stocks = require("../../../../structs/Stocks.js");

module.exports = {
  name: "available_shares",
  run: async (interaction) => {
    const ticker = interaction.options.getString("ticker").toUpperCase();
    const availableShares = interaction.options.getInteger("available_shares");

    const stocks = new Stocks();
    const previousAvailableShares = (await stocks.ticker(ticker)).availableShares;
    
    await stocks.setAvailableShares(ticker, availableShares);

    const embed = new EmbedBuilder()
      .setTitle("Available Shares")
      .setFields(
        {
          name: "Ticker",
          value: `${ticker}`
        },
        {
          name: "Available Shares",
          value: `**${previousAvailableShares}** → **${availableShares}**`
        },
      )
      .setColor("#BB8FCE")
      .setTimestamp()
      .setFooter({ text: "The Exchange  •  Invest in the future", iconURL: interaction.guild.iconURL() });

    return interaction.reply({ embeds: [embed] });
  }
};