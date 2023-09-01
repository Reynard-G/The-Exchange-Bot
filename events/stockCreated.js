const { EmbedBuilder } = require("discord.js");
const client = require("..");

client.emitter.on("stockCreated", async (ticker, companyName, availableShares, outstandingShares, totalOutstandingShares, pricePerShare) => {
  const auditChannel = client.channels.cache.get(process.env.AUDIT_CHANNEL_ID);

  auditChannel.send({
    embeds: [
      new EmbedBuilder()
        .setTitle("Stock Created")
        .setFields(
          {
            name: "Ticker",
            value: `${ticker}`
          },
          {
            name: "Company Name",
            value: `${companyName}`
          },
          {
            name: "Available Shares",
            value: `${availableShares}`
          },
          {
            name: "Outstanding Shares",
            value: `${outstandingShares}`
          },
          {
            name: "Total Outstanding Shares",
            value: `${totalOutstandingShares}`
          },
          {
            name: "Price Per Share",
            value: `${pricePerShare}`
          }
        )
        .setColor("Green")
        .setTimestamp()
        .setFooter({ text: "The Exchange  •  Invest in the future", iconURL: client.user.avatarURL() })
    ]
  });
});