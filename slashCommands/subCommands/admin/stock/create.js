const { EmbedBuilder } = require("discord.js");
const Account = require("../../../../structs/Account.js");
const Stocks = require("../../../../structs/Stocks.js");

module.exports = {
  name: "create",
  run: async (client, interaction) => {
    const ticker = interaction.options.getString("ticker").toUpperCase();
    const name = interaction.options.getString("name");
    const available_shares = interaction.options.getInteger("available_shares");
    const outstanding_shares = interaction.options.getInteger("outstanding_shares");
    const total_outstanding_shares = interaction.options.getInteger("total_outstanding_shares");
    const price = interaction.options.getNumber("price");

    const stocks = new Stocks();
    await stocks.create(ticker, name, available_shares, outstanding_shares, total_outstanding_shares, price);

    const account = new Account();

    const embed = new EmbedBuilder()
      .setTitle("Stock Created")
      .setDescription(`Successfully created stock **${ticker}**!`)
      .setFields(
        { name: "Name", value: name },
        { name: "Available Shares", value: available_shares.toString() },
        { name: "Outstanding Shares", value: outstanding_shares.toString() },
        { name: "Total Outstanding Shares", value: total_outstanding_shares.toString() },
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