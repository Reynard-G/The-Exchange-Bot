const { EmbedBuilder, ApplicationCommandType } = require("discord.js");
const Account = require("../../../structs/Account.js");
const { OrderNotFoundError, InsufficientPermissionsError } = require("../../../structs/Errors.js");

module.exports = {
  name: "cancel",
  run: async (client, interaction) => {
    const account = new Account();
    const orderID = interaction.options.getInteger("order_id");
    const accountID = await account.databaseID(interaction.user.id);

    const order = await account.order(orderID);
    if (!order || order.active === 0) {
      throw new OrderNotFoundError(orderID);
    }

    if (order.account_id !== accountID) {
      throw new InsufficientPermissionsError();
    }

    await account.cancelOrder(orderID);

    const embed = new EmbedBuilder()
      .setTitle("Order Cancelled")
      .setDescription(`Your order with ID **${orderID}** has been cancelled.`)
      .setColor("#BB8FCE")
      .setTimestamp()
      .setFooter({ text: "The Exchange  •  Invest in the future", iconURL: interaction.guild.iconURL() });

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};