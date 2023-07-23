const { EmbedBuilder } = require("discord.js");
const Decimal = require("decimal.js-light");
const Account = require("../../../../structs/Account.js");
const Stocks = require("../../../../structs/Stocks.js");

module.exports = {
  name: "buy",
  run: async (client, interaction) => {
    const ticker = interaction.options.getString("ticker").toUpperCase();
    const amount = interaction.options.getInteger("amount");
    const collar = interaction.options.getNumber("collar_percentage") ?? 5;

    const order_type_details = {
      order_transaction_type: "BUY",
      collar_percentage: collar,
    };

    const stocks = new Stocks(client);
    const share_price = await stocks.price(ticker);

    await stocks.buy(interaction.user.id, ticker, amount, "MARKET", order_type_details);

    const account = new Account();

    const embed = new EmbedBuilder()
      .setTitle("Market Buy Order")
      .setDescription(`You've placed a market buy order to buy shares of **${ticker}**.`)
      .addFields(
        { name: "Ticker", value: ticker, inline: true },
        { name: "Share(s)", value: amount.toString(), inline: true },
        { name: "Price Per Share", value: account.formatCurrency(share_price), inline: true },
        { name: "Total", value: account.formatCurrency(new Decimal(share_price).mul(amount)), inline: true },
        { name: "Collar", value: `${collar}%`, inline: true },
        { name: "Order Type", value: "MARKET", inline: true },
        { name: "Transaction Type", value: "BUY", inline: true },
      )
      .setColor("#BB8FCE")
      .setTimestamp()
      .setFooter({ text: "The Exchange  •  Invest in the future", iconURL: interaction.guild.iconURL() });

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};
