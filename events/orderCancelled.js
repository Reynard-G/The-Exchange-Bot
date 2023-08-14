const { EmbedBuilder } = require("discord.js");
const client = require("..");
const Account = require("../structs/Account.js");
const Stocks = require("../structs/Stocks.js");

client.emitter.on("orderCancelled", async (orderID) => {
  const account = new Account();
  const stocks = new Stocks();

  // Revert stock price changes
  const order = await account.order(orderID);
  const transactionType = order.order_transaction_type === "BUY" ? "SELL" : "BUY";
  const newPrice = await stocks.updatedPrice(order.remaining_amount + order.fulfilled_amount, order.ticker, transactionType);
  await stocks.setPrice(order.ticker, newPrice);

  const auditChannel = client.channels.cache.get(process.env.AUDIT_CHANNEL_ID);

  auditChannel.send({
    embeds: [
      new EmbedBuilder()
        .setTitle("Order Cancelled")
        .setFields(
          {
            name: "Order ID",
            value: `${orderID}`
          }
        )
        .setColor("Red")
        .setTimestamp()
        .setFooter({ text: "The Exchange  •  Invest in the future", iconURL: client.user.avatarURL() })
    ]
  });
});