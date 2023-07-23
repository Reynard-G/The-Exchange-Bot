const { EmbedBuilder } = require("discord.js");
const client = require("..");

client.emitter.on("orderCancelled", async (orderID) => {
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