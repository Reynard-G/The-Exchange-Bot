const { EmbedBuilder } = require("discord.js");
const Decimal = require("decimal.js-light");

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

    const share_price = await client.stocks.price(ticker);

    await client.stocks.sell(interaction.user.id, ticker, amount, "LIMIT", order_type_details);

    const embed = new EmbedBuilder()
      .setTitle("Limit Sell Order")
      .setDescription(`You've placed a limit sell order to sell shares of **${ticker}**.`)
      .addFields(
        { name: "Ticker", value: ticker, inline: true },
        { name: "Share(s)", value: amount.toString(), inline: true },
        { name: "Price Per Share", value: client.utils.formatCurrency(share_price), inline: true },
        { name: "Total", value: client.utils.formatCurrency(new Decimal(min_price).mul(amount)), inline: true },
        { name: "Min. Price Per Share", value: client.utils.formatCurrency(min_price), inline: true },
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