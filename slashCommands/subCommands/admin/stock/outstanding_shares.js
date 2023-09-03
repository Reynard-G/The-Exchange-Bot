const { EmbedBuilder } = require("discord.js");
const Stocks = require("../../../../structs/Stocks.js");

module.exports = {
  name: "outstanding_shares",
  run: async (client, interaction) => {
    const ticker = interaction.options.getString("ticker").toUpperCase();
    const outstandingShares = interaction.options.getInteger("outstanding_shares");

    const stocks = new Stocks();
    const previousOutstandingShares = (await stocks.ticker(ticker)).outstanding_shares;
    
    await stocks.setOutstandingShares(ticker, outstandingShares);

    const embed = new EmbedBuilder()
      .setTitle("Outstanding Shares")
      .setFields(
        {
          name: "Ticker",
          value: `${ticker}`
        },
        {
          name: "Outstanding Shares",
          value: `**${previousOutstandingShares}** → **${outstandingShares}**`
        },
      )
      .setColor("#BB8FCE")
      .setTimestamp()
      .setFooter({ text: "The Exchange  •  Invest in the future", iconURL: interaction.guild.iconURL() });

    return interaction.reply({ embeds: [embed] });
  }
};