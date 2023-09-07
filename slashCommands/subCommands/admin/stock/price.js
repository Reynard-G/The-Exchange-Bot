const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "price",
  run: async (client, interaction) => {
    const ticker = interaction.options.getString("ticker").toUpperCase();
    const price = interaction.options.getNumber("price");

    await client.stocks.setPrice(ticker, price);

    const embed = new EmbedBuilder()
      .setTitle("Stock Price Set")
      .setDescription(`Successfully set the price of **${ticker}**!`)
      .setFields(
        { name: "Price", value: client.utils.formatCurrency(price) }
      )
      .setColor("Green")
      .setTimestamp()
      .setFooter({ text: "The Exchange  •  Invest in the future", iconURL: interaction.guild.iconURL() });

    return interaction.reply({
      embeds: [embed]
    });
  }
};