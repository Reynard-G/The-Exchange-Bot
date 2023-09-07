const { EmbedBuilder } = require("discord.js");
const client = require("..");

client.emitter.on("accountUnfrozen", async (discordID) => {
  const accountID = await client.account.databaseID(discordID);
  const auditChannel = client.channels.cache.get(process.env.AUDIT_CHANNEL_ID);

  auditChannel.send({
    embeds: [
      new EmbedBuilder()
        .setTitle("Account Unfrozen")
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