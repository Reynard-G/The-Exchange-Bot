const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "delist",
  run: async (client, interaction) => {
    const ticker = interaction.options.getString("ticker").toUpperCase();

    await client.stocks.delist(ticker);

    const embed = new EmbedBuilder()
      .setTitle("Success")
      .setDescription(`Successfully delisted \`${ticker}\`.`)
      .setColor("Green")
      .setTimestamp()
      .setFooter({ text: "The Exchange  •  Invest in the future", iconURL: interaction.guild.iconURL() });

    return interaction.reply({
      embeds: [embed]
    });
  }
};