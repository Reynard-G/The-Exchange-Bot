const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "deposit",
  run: async (client, interaction) => {
    const user = interaction.options.getUser("user");
    const amount = interaction.options.getNumber("amount");

    const embed = new EmbedBuilder()
      .setTimestamp()
      .setFooter({ text: `The Exchange  •  Invest in the future`, iconURL: interaction.guild.iconURL() });

    const isRegistered = await client.account.isRegistered(user.id);
    if (!isRegistered) {
      embed.setTitle("Error")
        .setDescription("That user is not registered.")
        .setColor("Red");
    }

    await client.account.addBalance(user.id, amount, 0, `Deposited ${client.utils.formatCurrency(amount)} to ${user.id}'s account by ${interaction.user.tag}.`);
    embed.setTitle("Success")
      .setDescription(`Successfully deposited **${client.utils.formatCurrency(amount)}** to <@${user.id}>'s account.`)
      .setColor("Green");

    return interaction.reply({
      embeds: [embed]
    });
  }
};