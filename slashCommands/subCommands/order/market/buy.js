const { EmbedBuilder } = require("discord.js");
const Decimal = require("decimal.js-light");

module.exports = {
  name: "buy",
  run: async (client, interaction) => {
    const ticker = interaction.options.getString("ticker").toUpperCase();
    const amount = interaction.options.getInteger("amount");

    const order_type_details = {
      order_transaction_type: "BUY"
    };

    await client.stocks.buy(interaction.user.id, ticker, amount, "MARKET", order_type_details);

    const share_price = await client.stocks.price(ticker);
    const embed = new EmbedBuilder()
      .setTitle("Market Buy Order")
      .setDescription(`You've placed a market buy order to buy shares of **${ticker}**.`)
      .addFields(
        { name: "Ticker", value: ticker, inline: true },
        { name: "Share(s)", value: amount.toString(), inline: true },
        { name: "Price Per Share", value: client.utils.formatCurrency(share_price), inline: true },
        { name: "Total", value: client.utils.formatCurrency(new Decimal(share_price).mul(amount)), inline: true },
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
