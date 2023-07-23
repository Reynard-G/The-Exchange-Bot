const { EmbedBuilder, ApplicationCommandType } = require("discord.js");
const Account = require("../../structs/Account.js");

module.exports = {
  name: "balance",
  description: "View your balance.",
  cooldown: 3000,
  type: ApplicationCommandType.ChatInput,
  run: async (client, interaction) => {
    const account = new Account();
    const balance = await account.balance(interaction.user.id);

    const embed = new EmbedBuilder()
      .setTitle("Balance")
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
