const { EmbedBuilder } = require("discord.js");
const client = require("..");

client.emitter.on("availableSharesUpdated", async (ticker, oldAvailableShares, newAvailableShares) => {
  const auditChannel = client.channels.cache.get(process.env.AUDIT_CHANNEL_ID);

  auditChannel.send({
    embeds: [
      new EmbedBuilder()
        .setTitle("Available Shares Updated")
        .setFields(
          {
            name: "Ticker",
            value: `${ticker}`
          },
          {
            name: "Available Shares",
            value: `**${oldAvailableShares}** → **${newAvailableShares}**`
          }
        )
        .setColor("Green")
        .setTimestamp()
        .setFooter({ text: "The Exchange  •  Invest in the future", iconURL: client.user.avatarURL() })
    ]
  });
});