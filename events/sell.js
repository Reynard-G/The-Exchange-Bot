const { EmbedBuilder } = require("discord.js");
const client = require("..");

client.emitter.on("sell", async (discordID, ticker, amount, order_type, order_type_details) => {
  const auditChannel = client.channels.cache.get(process.env.TRADING_CHANNEL_ID);

  auditChannel.send({
    embeds: [
      new EmbedBuilder()
        .setTitle("Sell Order")
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
            name: "Order Type",
            value: `${order_type}`
          },
          {
            name: "Order Type Details",
            value: `${order_type === "MARKET" ? `Collar: ${order_type_details.collar_percentage}%` : `Limit: ${order_type_details.limit_price}`}`
          }
        )
        .setColor("#BB8FCE")
        .setTimestamp()
        .setFooter({ text: "The Exchange  •  Invest in the future", iconURL: client.user.avatarURL() })
    ]
  });
});