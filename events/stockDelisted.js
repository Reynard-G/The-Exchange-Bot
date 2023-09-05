const { EmbedBuilder } = require("discord.js");
const client = require("..");

client.emitter.on("stockDelisted", async (ticker) => {
  const auditChannel = client.channels.cache.get(process.env.AUDIT_CHANNEL_ID);

  auditChannel.send({
    embeds: [
      new EmbedBuilder()
        .setTitle("Stock Delisted")
        .setFields(
          {
            name: "Ticker",
            value: `${ticker}`
          }
        )
        .setColor("Red")
        .setTimestamp()
        .setFooter({ text: "The Exchange  •  Invest in the future", iconURL: client.user.avatarURL() })
    ]
  });
});