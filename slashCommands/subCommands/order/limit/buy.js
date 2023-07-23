const { EmbedBuilder } = require("discord.js");
const Decimal = require("decimal.js-light");
const Account = require("../../../../structs/Account.js");
const Stocks = require("../../../../structs/Stocks.js");
const { InvalidLimitPriceError } = require("../../../../structs/Errors.js");

module.exports = {
  name: "buy",
  run: async (client, interaction) => {
    const ticker = interaction.options.getString("ticker").toUpperCase();
    const amount = interaction.options.getInteger("amount");
    const max_price = interaction.options.getNumber("max_price");

    const order_type_details = {
      order_transaction_type: "BUY",
      limit_price: max_price,
    };

    const stocks = new Stocks();
    const share_price = await stocks.price(ticker);

    // Check if max_price is >= to the share price
    /*if (new Decimal(max_price).lt(share_price)) {
      throw new InvalidLimitPriceError(max_price);
    }*/

    await stocks.buy(interaction.user.id, ticker, amount, "LIMIT", order_type_details);

    const account = new Account();

    const embed = new EmbedBuilder()
      .setTitle("Limit Buy Order")
      .setDescription(`You've placed a limit buy order to buy shares of **${ticker}**.`)
      .addFields(
        { name: "Ticker", value: ticker, inline: true },
        { name: "Share(s)", value: amount.toString(), inline: true },
        { name: "Price Per Share", value: account.formatCurrency(share_price), inline: true },
        { name: "Total", value: account.formatCurrency(new Decimal(max_price).mul(amount)), inline: true },
        { name: "Max. Price Per Share", value: account.formatCurrency(max_price), inline: true },
        { name: "Order Type", value: "LIMIT", inline: true },
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