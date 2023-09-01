const { EmbedBuilder } = require("discord.js");
const client = require("..");

client.emitter.on("imageUpdated", async (ticker, imageBuffer) => {
  const auditChannel = client.channels.cache.get(process.env.AUDIT_CHANNEL_ID);

  auditChannel.send({
    embeds: [
      new EmbedBuilder()
        .setTitle("Image Updated")
        .setFields(
          {
            name: "Ticker",
            value: `${ticker}`
          }
        )
        .setColor("Green")
        .setImage("attachment://image.png")
        .setTimestamp()
        .setFooter({ text: "The Exchange  •  Invest in the future", iconURL: client.user.avatarURL() })
    ],
    files: [
      {
        attachment: imageBuffer,
        name: "image.png"
      }
    ]
  });
});