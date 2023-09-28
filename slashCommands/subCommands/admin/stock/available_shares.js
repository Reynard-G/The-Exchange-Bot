const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "available_shares",
  run: async (client, interaction) => {
    const ticker = interaction.options.getString("ticker").toUpperCase();
    const availableShares = interaction.options.getInteger("amount");

    const previousAvailableShares = (await client.stocks.ticker(ticker)).available_shares;

    await client.stocks.setAvailableShares(ticker, availableShares);

    const embed = new EmbedBuilder()
      .setTitle("Available Shares")
      .setFields(
        { name: "Ticker", value: `${ticker}` },
        { name: "Available Shares", value: `**${previousAvailableShares}** → **${availableShares}**` },
      )
      .setColor("#BB8FCE")
      .setTimestamp()
      .setFooter({ text: "The Exchange  •  Invest in the future", iconURL: interaction.guild.iconURL() });

    return interaction.reply({ embeds: [embed] });
  }
};