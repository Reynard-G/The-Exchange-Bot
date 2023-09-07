const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "shareholders",
  run: async (client, interaction) => {
    const ticker = interaction.options.getString("ticker").toUpperCase();
    const exchange_discord_id = interaction.applicationId;

    const shareholders = await client.stocks.shareholders(ticker, exchange_discord_id);

    const embed = new EmbedBuilder()
      .setTitle("Shareholders")
      .setColor("#BB8FCE")
      .setTimestamp()
      .setFooter({ text: "The Exchange  •  Invest in the future", iconURL: interaction.guild.iconURL() });

    // If there are no shareholders, return a message saying so
    if (shareholders.length === 0) {
      embed.setDescription(`There are no shareholders for **${ticker}**.`);
    } else {
      // Otherwise, list the shareholders
      embed.setDescription(`Shareholders for **${ticker}**:`);
      embed.setFields(
        shareholders.map((shareholder) => {
          return {
            name: `${shareholder.username}`,
            value: `${shareholder.shares} share(s)`,
            inline: true,
          };
        })
      );
    }

    return interaction.reply({ embeds: [embed] });
  }
};