const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "outstanding_shares",
  run: async (client, interaction) => {
    const ticker = interaction.options.getString("ticker").toUpperCase();
    const outstandingShares = interaction.options.getInteger("amount");

    const previousOutstandingShares = (await client.stocks.ticker(ticker)).outstanding_shares;

    await client.stocks.setOutstandingShares(ticker, outstandingShares);

    const embed = new EmbedBuilder()
      .setTitle("Outstanding Shares")
      .setFields(
        { name: "Ticker", value: `${ticker}` },
        { name: "Outstanding Shares", value: `**${previousOutstandingShares}** → **${outstandingShares}**` },
      )
      .setColor("#BB8FCE")
      .setTimestamp()
      .setFooter({ text: "The Exchange  •  Invest in the future", iconURL: interaction.guild.iconURL() });

    return interaction.reply({ embeds: [embed] });
  }
};