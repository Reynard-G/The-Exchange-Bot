const { EmbedBuilder } = require("discord.js");
const Account = require("../../../../structs/Account.js");

module.exports = {
  name: "balance",
  run: async (client, interaction) => {
    const account = new Account();
    const user = interaction.options.getUser("user");
    const balance = await account.balance(user.id);

    const embed = new EmbedBuilder()
      .setTitle(`${user.username}'s Balance`)
      .setFields(
        {
          name: "Balance:",
          value: `${account.formatCurrency(balance)}`
        }
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
