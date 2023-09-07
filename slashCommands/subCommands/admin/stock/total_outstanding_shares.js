const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "total_outstanding_shares",
  run: async (client, interaction) => {
    const ticker = interaction.options.getString("ticker").toUpperCase();
    const totalOutstandingShares = interaction.options.getInteger("amount");

    const previousTotalOutstandingShares = (await client.stocks.ticker(ticker)).total_outstanding_shares;

    await client.stocks.setTotalOutstandingShares(ticker, totalOutstandingShares);

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