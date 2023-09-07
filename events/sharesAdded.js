const { EmbedBuilder } = require("discord.js");
const client = require("..");

client.emitter.on("sharesAdded", async (discordID, ticker, amount, note) => {
  const accountID = await client.account.databaseID(discordID);
  const auditChannel = client.channels.cache.get(process.env.AUDIT_CHANNEL_ID);

  auditChannel.send({
    embeds: [
      new EmbedBuilder()
        .setTitle("Shares Added")
        .setFields(
          {
            name: "Account ID",
            value: `${accountID}`
          },
          {
            name: "Discord",
            value: `<@${discordID}> (${discordID})`
          },
          {
            name: "Ticker",
            value: `${ticker}`
          },
          {
            name: "Amount",
            value: `${amount}`
          },
          {
            name: "Note",
            value: `${note}`
          }
        )
        .setColor("Green")
        .setTimestamp()
        .setFooter({ text: "The Exchange  •  Invest in the future", iconURL: client.user.avatarURL() })
    ]
  });
});
