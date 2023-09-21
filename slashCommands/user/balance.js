const { EmbedBuilder, ApplicationCommandType } = require("discord.js");

module.exports = {
  name: "balance",
  description: "View your balance.",
  cooldown: 3000,
  dm_permission: false,
  type: ApplicationCommandType.ChatInput,
  run: async (client, interaction) => {
    const balance = await client.account.balance(interaction.user.id);

    const embed = new EmbedBuilder()
      .setTitle("Balance")
      .setFields(
        {
          name: "Balance:",
          value: `${client.utils.formatCurrency(balance)}`
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
