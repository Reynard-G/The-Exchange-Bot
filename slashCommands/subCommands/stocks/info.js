const { EmbedBuilder } = require("discord.js");
const Account = require("../../../structs/Account.js");
const Stocks = require("../../../structs/Stocks.js");

module.exports = {
  name: "info",
  run: async (client, interaction) => {
    const stocks = new Stocks();
    const ticker = interaction.options.getString("ticker");
    const stock = await stocks.ticker(ticker);

    const account = new Account();

    const embed = new EmbedBuilder()
      .setTitle(`${stock.ticker} Stock Info`)
      .addFields(
        { name: "Ticker", value: stock.ticker.toString(), inline: true },
        { name: "Price", value: account.formatCurrency(stock.price), inline: true },
        { name: "Volume", value: `${stock.available_shares}/${stock.outstanding_shares} (${stock.total_outstanding_shares} total)`, inline: true },
        { name: "Frozen?", value: stock.frozen === 1 ? "Yes" : "No", inline: true },
      )
      .setColor("#BB8FCE")
      .setTimestamp()
      .setFooter({ text: "The Exchange  •  Invest in the future", iconURL: interaction.guild.iconURL() });

    // If the stock does not have an image, do not add it to the embed.
    if (stock.image) {
      embed.setThumbnail(`attachment://${stock.ticker}.png`);

      return interaction.reply({
        embeds: [embed],
        files: [{
          name: `${stock.ticker}.png`,
          attachment: stock.image
        }],
        ephemeral: true
      });
    } else {
      return interaction.reply({
        embeds: [embed],
        ephemeral: true
      });
    }
  }
};
