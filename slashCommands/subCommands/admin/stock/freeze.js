const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "freeze",
  run: async (client, interaction) => {
    const ticker = interaction.options.getString("ticker").toUpperCase();

    await client.stocks.freeze(ticker);

    const embed = new EmbedBuilder()
      .setTitle("Success")
      .setDescription(`Successfully froze \`${ticker}\`.`)
      .setColor("Green")
      .setTimestamp()
      .setFooter({ text: "The Exchange  •  Invest in the future", iconURL: interaction.guild.iconURL() });

    return interaction.reply({
      embeds: [embed]
    });
  }
};