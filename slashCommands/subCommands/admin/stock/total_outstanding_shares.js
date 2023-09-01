const { EmbedBuilder } = require("discord.js");
const Stocks = require("../../../../structs/Stocks.js");

module.exports = {
  name: "total_outstanding_shares",
  run: async (interaction) => {
    const ticker = interaction.options.getString("ticker").toUpperCase();
    const totalOutstandingShares = interaction.options.getInteger("total_outstanding_shares");

    const stocks = new Stocks();
    const previousTotalOutstandingShares = (await stocks.ticker(ticker)).total_outstanding_shares;
    
    await stocks.setTotalOutstandingShares(ticker, totalOutstandingShares);

    const embed = new EmbedBuilder()
      .setTitle("Total Outstanding Shares")
      .setFields(
        {
          name: "Ticker",
          value: `${ticker}`
        },
        {
          name: "Total Outstanding Shares",
          value: `**${previousTotalOutstandingShares}** → **${totalOutstandingShares}**`
        },
      )
      .setColor("#BB8FCE")
      .setTimestamp()
      .setFooter({ text: "The Exchange  •  Invest in the future", iconURL: interaction.guild.iconURL() });

    return interaction.reply({ embeds: [embed] });
  }
};