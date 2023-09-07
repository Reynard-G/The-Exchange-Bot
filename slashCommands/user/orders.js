const { EmbedBuilder, ApplicationCommandType } = require("discord.js");

module.exports = {
  name: "orders",
  description: "View your active orders.",
  cooldown: 3000,
  type: ApplicationCommandType.ChatInput,
  run: async (client, interaction) => {
    const orders = await client.account.orders(interaction.user.id);

    const embed = new EmbedBuilder()
      .setTitle("Orders")
      .setColor("#BB8FCE")
      .setTimestamp()
      .setFooter({ text: "The Exchange  •  Invest in the future", iconURL: interaction.guild.iconURL() });

    // If the user has no orders, return a description.
    if (!orders) {
      embed.setDescription("You currently have no orders.");
    } else {
      embed.setFields(
        orders.map(order => {
          return {
            name: order.ticker,
            value: `**ID:** ${order.id}` +
              `\n**Amount:** ${order.fulfilled_amount + order.remaining_amount} share(s) @ ${client.utils.formatCurrency(order.price_per_share)} per share` +
              `\n**Order Type:** ${order.order_type}` +
              `\n**Fulfillment Status:** ${order.fulfilled_amount}/${order.fulfilled_amount + order.remaining_amount} shares fulfilled`
          };
        })
      );
    }

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};
