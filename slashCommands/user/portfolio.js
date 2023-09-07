const { EmbedBuilder, ApplicationCommandType } = require("discord.js");

module.exports = {
  name: "portfolio",
  description: "View your portfolio.",
  cooldown: 3000,
  type: ApplicationCommandType.ChatInput,
  run: async (client, interaction) => {
    const portfolio = await client.account.portfolio(interaction.user.id);

    const embed = new EmbedBuilder()
      .setTitle("Portfolio")
      .setColor("#BB8FCE")
      .setTimestamp()
      .setFooter({ text: "The Exchange  •  Invest in the future", iconURL: interaction.guild.iconURL() });

    // If the user has no shares, return a description.
    if (portfolio.length === 0) {
      embed.setDescription("You currently have no shares.");
    } else {
      embed.addFields(
        portfolio.map((stock) => {
          return {
            name: stock.ticker,
            value: `${stock.total_shares} share(s)` // If none, "You have no shares"
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
