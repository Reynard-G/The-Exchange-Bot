const { EmbedBuilder } = require("discord.js");
const Account = require("../structs/Account.js");
const client = require("..");

const account = new Account();

client.emitter.on("sharesAdded", async (discordID, ticker, amount, note) => {
  const accountID = await account.databaseID(discordID);
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
