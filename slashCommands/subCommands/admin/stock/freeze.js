const { EmbedBuilder } = require("discord.js");
const Stocks = require("../../../../structs/Stocks.js");

module.exports = {
  name: "freeze",
  run: async (client, interaction) => {
    const stock = new Stocks();
    const ticker = interaction.options.getString("ticker");

    const embed = new EmbedBuilder()
      .setTimestamp()
      .setFooter({ text: `The Exchange  •  Invest in the future`, iconURL: interaction.guild.iconURL() });

    const isValidTicker = await stock.ticker(ticker);
    if (!isValidTicker) {
      embed.setTitle("Error")
        .setDescription("That ticker is invalid. Please check if the ticker is correct.")
        .setColor("Red");
    } else {
      const isFrozen = await stock.isFrozen(ticker);
      if (isFrozen) {
        embed.setTitle("Error")
          .setDescription(`The ticker \`${ticker}\` is already frozen. Use \`/admin stock unfreeze\` to unfreeze it.`)
          .setColor("Red");
      } else {
        await stock.freeze(ticker);
        embed.setTitle("Success")
          .setDescription(`Successfully froze \`${ticker}\`.`)
          .setColor("Green");
      }
    }

    return interaction.reply({
      embeds: [embed]
    });
  }
};