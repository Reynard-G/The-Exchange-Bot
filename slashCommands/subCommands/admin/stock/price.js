const { EmbedBuilder } = require("discord.js");
const Account = require("../../../../structs/Account.js");
const Stocks = require("../../../../structs/Stocks.js");

module.exports = {
  name: "price",
  run: async (client, interaction) => {
    const ticker = interaction.options.getString("ticker").toUpperCase();
    const price = interaction.options.getNumber("price");

    const stocks = new Stocks();
    await stocks.setPrice(ticker, price);

    const account = new Account();

    const embed = new EmbedBuilder()
      .setTitle("Stock Price Set")
      .setDescription(`Successfully set the price of **${ticker}**!`)
      .setFields(
        { name: "Price", value: account.formatCurrency(price) }
      )
      .setColor("Green")
      .setTimestamp()
      .setFooter({ text: "The Exchange  •  Invest in the future", iconURL: interaction.guild.iconURL() });

    return interaction.reply({
      embeds: [embed]
    });
  }
};