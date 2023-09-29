const { EmbedBuilder } = require("discord.js");
const client = require("..");

client.emitter.on("transfer", async (fromUserID, toUserID, money, ticker, shares) => {
  const fromUser = await client.users.fetch(fromUserID);
  const toUser = await client.users.fetch(toUserID);

  const fromEmbed = new EmbedBuilder()
    .setTitle("Sent Transfer")
    .setFields(
      { name: "From", value: `<@${fromUser.id}>` },
      { name: "To", value: `<@${toUser.id}>` }
    )
    .setColor("#BB8FCE")
    .setTimestamp()
    .setFooter({ text: "The Exchange  •  Invest in the future", iconURL: client.user.avatarURL() });

  const toEmbed = new EmbedBuilder()
    .setTitle("Received Transfer")
    .setFields(
      { name: "From", value: `<@${fromUser.id}>` },
      { name: "To", value: `<@${toUser.id}>` }
    )
    .setColor("#BB8FCE")
    .setTimestamp()
    .setFooter({ text: "The Exchange  •  Invest in the future", iconURL: client.user.avatarURL() });

  if (money) {
    fromEmbed.addFields( { name: "Amount", value: client.utils.formatCurrency(money) } );
    toEmbed.addFields( { name: "Amount", value: client.utils.formatCurrency(money) } );
  }

  if (ticker && shares) {
    fromEmbed.addFields(
      { name: "Ticker", value: `${ticker}` },
      { name: "Amount", value: `${shares}` }
    );

    toEmbed.addFields(
      { name: "Ticker", value: `${ticker}` },
      { name: "Amount", value: `${shares}` }
    );
  }

  const fromUserDMChannel = await fromUser.createDM();
  const toUserDMChannel = await toUser.createDM();

  fromUserDMChannel.send({ embeds: [fromEmbed] });
  toUserDMChannel.send({ embeds: [toEmbed] });
});