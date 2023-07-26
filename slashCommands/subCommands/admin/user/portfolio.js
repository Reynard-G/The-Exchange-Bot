const { EmbedBuilder } = require("discord.js");
const Account = require("../../../../structs/Account.js");

module.exports = {
  name: "portfolio",
  run: async (client, interaction) => {
    const account = new Account();
    const user = interaction.options.getUser("user");
    const portfolio = await account.portfolio(user.id);

    const embed = new EmbedBuilder()
      .setTitle(`${user.username}'s Portfolio`)
      .setColor("#BB8FCE")
      .setTimestamp()
      .setFooter({ text: "The Exchange  •  Invest in the future", iconURL: interaction.guild.iconURL() });

    // If the user has no shares, return a description.
    if (portfolio.length === 0) {
      embed.setDescription("This user currently has no shares.");
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