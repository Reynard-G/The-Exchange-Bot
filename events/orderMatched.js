const { EmbedBuilder } = require("discord.js");
const client = require("..");

client.emitter.on("orderMatched", async (recipientDatabaseID, initiatorDatabaseID, fulfilledAmount, recipientRemainingAmount, initiatorRemainingAmount, recipientOrderType, initiatorOrderType, pricePerShare, ticker) => {
  const recipient = await client.account.discordID(recipientDatabaseID);
  const initiator = await client.account.discordID(initiatorDatabaseID);

  const recipientEmbed = new EmbedBuilder()
    .setTitle("Order Matched")
    .setDescription(`Your order for ${ticker} has been matched.`)
    .addFields(
      { name: "Ticker", value: ticker },
      { name: "Order Type", value: recipientOrderType },
      { name: "Fulfilled Share(s)", value: fulfilledAmount.toString() },
      { name: "Price Per Share", value: client.utils.formatCurrency(pricePerShare) },
      { name: "Total", value: client.utils.formatCurrency(new Decimal(pricePerShare).mul(fulfilledAmount)) },
      { name: "Fufillment Status", value: `${fulfilledAmount}/${fulfilledAmount + recipientRemainingAmount} shares fulfilled` }
    )
    .setColor("#BB8FCE")
    .setTimestamp()
    .setFooter({ text: "The Exchange  •  Invest in the future", iconURL: client.guild.iconURL() });

  const initiatorEmbed = new EmbedBuilder()
    .setTitle("Order Matched")
    .setDescription(`Your order for ${ticker} has been matched.`)
    .addFields(
      { name: "Ticker", value: ticker },
      { name: "Order Type", value: initiatorOrderType },
      { name: "Fulfilled Share(s)", value: fulfilledAmount.toString() },
      { name: "Price Per Share", value: client.utils.formatCurrency(pricePerShare) },
      { name: "Total", value: client.utils.formatCurrency(new Decimal(pricePerShare).mul(fulfilledAmount)) },
      { name: "Fufillment Status", value: `${fulfilledAmount}/${fulfilledAmount + initiatorRemainingAmount} shares fulfilled` }
    )
    .setColor("#BB8FCE")
    .setTimestamp()
    .setFooter({ text: "The Exchange  •  Invest in the future", iconURL: client.guild.iconURL() });

  const recipientHasExchangePlus = await client.account.hasExchangePlus(recipientDatabaseID);
  const initiatorHasExchangePlus = await client.account.hasExchangePlus(initiatorDatabaseID);

  if (recipientHasExchangePlus) {
    const dmChannel = await recipient.createDM();
    dmChannel.send({ embeds: [recipientEmbed] });
  }

  if (initiatorHasExchangePlus) {
    const dmChannel = await initiator.createDM();
    dmChannel.send({ embeds: [initiatorEmbed] });
  }
});