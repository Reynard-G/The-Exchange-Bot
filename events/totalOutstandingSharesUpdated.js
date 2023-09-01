const { EmbedBuilder } = require("discord.js");
const client = require("..");

client.emitter.on("totalOutstandingSharesUpdated", async (ticker, totalOutstandingShares) => {
  const auditChannel = client.channels.cache.get(process.env.AUDIT_CHANNEL_ID);

  auditChannel.send({
    embeds: [
      new EmbedBuilder()
        .setTitle("Total Outstanding Shares Updated")
        .setFields(
          {
            name: "Ticker",
            value: `${ticker}`
          },
          {
            name: "Total Outstanding Shares",
            value: `${totalOutstandingShares}`
          }
        )
        .setColor("Green")
        .setTimestamp()
        .setFooter({ text: "The Exchange  •  Invest in the future", iconURL: client.user.avatarURL() })
    ]
  });
});