const { EmbedBuilder } = require("discord.js");
const Account = require("../structs/Account.js");
const client = require("..");

const account = new Account();

client.emitter.on("accountFrozen", async (discordID) => {
  const accountID = await account.databaseID(discordID);
  const auditChannel = client.channels.cache.get(process.env.AUDIT_CHANNEL_ID);

  auditChannel.send({
    embeds: [
      new EmbedBuilder()
        .setTitle("Account Frozen")
        .setFields(
          {
            name: "Account ID",
            value: `${accountID}`
          },
          {
            name: "Discord",
            value: `<@${discordID}> (${discordID})`
          }
        )
        .setColor("Gold")
        .setTimestamp()
        .setFooter({ text: "The Exchange  •  Invest in the future", iconURL: client.user.avatarURL() })
    ]
  });
});