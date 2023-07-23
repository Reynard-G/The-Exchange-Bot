const { EmbedBuilder } = require("discord.js");
const Account = require("../structs/Account.js");
const client = require("..");

const account = new Account();

client.emitter.on("balanceAdded", async (discordID, amount, note) => {
  const user = await account.databaseID(discordID);
  const auditChannel = client.channels.cache.get(process.env.AUDIT_CHANNEL_ID);

  auditChannel.send({
    embeds: [
      new EmbedBuilder()
        .setTitle("Balance Added")
        .setFields(
          {
            name: "Account ID",
            value: `${user}`
          },
          {
            name: "Discord",
            value: `<@${discordID}> (${discordID})`
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