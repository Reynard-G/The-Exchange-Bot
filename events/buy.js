const { EmbedBuilder } = require("discord.js");
const Decimal = require("decimal.js-light");
const client = require("..");
const Account = require("../structs/Account.js");

const account = new Account();

client.emitter.on("buy", async (ticker, amount, share_price, order_type, order_type_details) => {
  const auditChannel = client.channels.cache.get(process.env.TRADING_CHANNEL_ID);

  auditChannel.send({
    embeds: [
      new EmbedBuilder()
        .setTitle("Buy Order")
        .setFields(
          {
            name: "Ticker",
            value: `${ticker}`
          },
          {
            name: "Amount",
            value: `${amount}`
          },
          {
            name: "Total Value",
            value: `${account.formatCurrency(new Decimal(share_price).mul(amount))}`
          },
          {
            name: "Order Type",
            value: `${order_type}`
          },
          {
            name: "Order Type Details",
            value: `${order_type === "MARKET" ? `N/A` : `Limit: ${account.formatCurrency(order_type_details.limit_price)}`}`
          }
        )
        .setColor("#BB8FCE")
        .setTimestamp()
        .setFooter({ text: "The Exchange  •  Invest in the future", iconURL: client.user.avatarURL() })
    ]
  });
});