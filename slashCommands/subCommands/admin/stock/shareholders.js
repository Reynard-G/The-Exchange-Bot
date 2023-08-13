const { EmbedBuilder } = require("discord.js");
const Stocks = require("../../../../structs/Stocks.js");

module.exports = {
  name: "shareholders",
  run: async (client, interaction) => {
    const ticker = interaction.options.getString("ticker").toUpperCase();
    const exchange_discord_id = interaction.applicationId;

    const stocks = new Stocks();
    const shareholders = await stocks.shareholders(ticker, exchange_discord_id);

    const embed = new EmbedBuilder()
      .setTitle("Shareholders")
      .setDescription(`Shareholders for **${ticker}**.`)
      .setFields(
        shareholders.map((shareholder) => {
          return {
            name: `${shareholder.username}`,
            value: `${shareholder.shares} share(s)`,
            inline: true,
          };
        })
      )
      .setColor("#BB8FCE")
      .setTimestamp()
      .setFooter({ text: "The Exchange  •  Invest in the future", iconURL: interaction.guild.iconURL() });

    return interaction.reply({ embeds: [embed] });
  }
};