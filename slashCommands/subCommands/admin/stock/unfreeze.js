const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "unfreeze",
  run: async (client, interaction) => {
    const ticker = interaction.options.getString("ticker");

    await client.stocks.unfreeze(ticker);

    const embed = new EmbedBuilder()
      .setTitle("Success")
      .setDescription(`Successfully unfroze \`${ticker}\`.`)
      .setColor("Green")
      .setTimestamp()
      .setFooter({ text: "The Exchange  •  Invest in the future", iconURL: interaction.guild.iconURL() });

    return interaction.reply({
      embeds: [embed]
    });
  }
};