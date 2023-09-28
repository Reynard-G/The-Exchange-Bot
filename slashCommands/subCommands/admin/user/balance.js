const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "balance",
  run: async (client, interaction) => {
    const user = interaction.options.getUser("user");
    const balance = await client.account.balance(user.id);

    const embed = new EmbedBuilder()
      .setTitle(`${user.username}'s Balance`)
      .setFields(
        { name: "Balance:", value: `${client.utils.formatCurrency(balance)}` }
      )
      .setColor("#BB8FCE")
      .setTimestamp()
      .setFooter({ text: "The Exchange  •  Invest in the future", iconURL: interaction.guild.iconURL() });

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};
