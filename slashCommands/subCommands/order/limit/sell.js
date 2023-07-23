const { EmbedBuilder } = require("discord.js");
const Decimal = require("decimal.js-light");
const Account = require("../../../../structs/Account.js");
const Stocks = require("../../../../structs/Stocks.js");
const { InvalidLimitPriceError } = require("../../../../structs/Errors.js");

module.exports = {
  name: "sell",
  run: async (client, interaction) => {
    const ticker = interaction.options.getString("ticker").toUpperCase();
    const amount = interaction.options.getInteger("amount");
    const min_price = interaction.options.getNumber("min_price");

    const order_type_details = {
      order_transaction_type: "SELL",
      limit_price: min_price,
    };

    const stocks = new Stocks();
    const share_price = await stocks.price(ticker);

    // Check if min_price is <= to the share price
    /*if (new Decimal(min_price).gt(share_price)) {
      throw new InvalidLimitPriceError(min_price);
    }*/

    await stocks.sell(interaction.user.id, ticker, amount, "LIMIT", order_type_details);

    const account = new Account();

    const embed = new EmbedBuilder()
      .setTitle("Limit Sell Order")
      .setDescription(`You've placed a limit sell order to sell shares of **${ticker}**.`)
      .addFields(
        { name: "Ticker", value: ticker, inline: true },
        { name: "Share(s)", value: amount.toString(), inline: true },
        { name: "Price Per Share", value: account.formatCurrency(share_price), inline: true },
        { name: "Total", value: account.formatCurrency(new Decimal(min_price).mul(amount)), inline: true },
        { name: "Min. Price Per Share", value: account.formatCurrency(min_price), inline: true },
        { name: "Order Type", value: "LIMIT", inline: true },
        { name: "Transaction Type", value: "SELL", inline: true },
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