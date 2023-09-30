const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "valuation",
  run: async (client, interaction) => {
    const ticker = interaction.options.getString("ticker").toUpperCase();
    const valuation = interaction.options.getNumber("amount");

    await client.stocks.setValuation(ticker, valuation);

    const embed = new EmbedBuilder()
      .setTitle("Valuation")
      .setFields(
        { name: "Ticker", value: `${ticker}` },
        { name: "Valuation", value: `**${valuation}**` },
      )
      .setColor("#BB8FCE")
      .setTimestamp()
      .setFooter({ text: "The Exchange  •  Invest in the future", iconURL: interaction.guild.iconURL() });

    return interaction.reply({ embeds: [embed] });
  }
};