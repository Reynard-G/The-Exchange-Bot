const { EmbedBuilder } = require("discord.js");
const client = require("..");

client.emitter.on("outstandingSharesUpdated", async (ticker, outstandingShares) => {
  const auditChannel = client.channels.cache.get(process.env.AUDIT_CHANNEL_ID);

  auditChannel.send({
    embeds: [
      new EmbedBuilder()
        .setTitle("Outstanding Shares Updated")
        .setFields(
          {
            name: "Ticker",
            value: `${ticker}`
          },
          {
            name: "Outstanding Shares",
            value: `${outstandingShares}`
          }
        )
        .setColor("Green")
        .setTimestamp()
        .setFooter({ text: "The Exchange  •  Invest in the future", iconURL: client.user.avatarURL() })
    ]
  });
});