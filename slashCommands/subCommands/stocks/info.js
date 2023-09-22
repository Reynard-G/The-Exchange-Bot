const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  name: "info",
  run: async (client, interaction) => {
    const ticker = interaction.options.getString("ticker").toUpperCase();
    const stock = await client.stocks.ticker(ticker);

    const percentage_change = await client.stocks.dailyPercentageChange(ticker);
    const percentage_change_formatted = percentage_change > 0 ? `+${percentage_change}%` : `${percentage_change}%`;

    const embed = new EmbedBuilder()
      .setTitle(`${stock.ticker} Stock Info`)
      .addFields(
        { name: "Ticker", value: stock.ticker.toString() },
        { name: "Price", value: `${client.utils.formatCurrency(stock.price)} (${percentage_change_formatted})` },
        { name: "Volume", value: `${stock.available_shares}/${stock.outstanding_shares} (${stock.total_outstanding_shares} total)` },
        { name: "Frozen?", value: stock.frozen === 1 ? "Yes" : "No" },
      )
      .setColor("#BB8FCE")
      .setTimestamp()
      .setFooter({ text: "The Exchange  •  Invest in the future", iconURL: interaction.guild.iconURL() });

    const hasExchangePlus = await client.account.hasExchangePlus(interaction.user.id);
    const buttons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId("stock:stats")
          .setLabel("Statistics")
          .setStyle(ButtonStyle.Primary)
          .setEmoji("📊")
          .setDisabled(!hasExchangePlus),
        new ButtonBuilder()
          .setCustomId("stock:charts")
          .setLabel("Charts")
          .setStyle(ButtonStyle.Primary)
          .setEmoji("📈")
          .setDisabled(!hasExchangePlus),
      );

    // If the stock does not have an image, do not add it to the embed.
    if (stock.image) {
      embed.setThumbnail(`attachment://${stock.ticker}.png`);

      return interaction.reply({
        embeds: [embed],
        components: [buttons],
        files: [{
          name: `${stock.ticker}.png`,
          attachment: stock.image
        }],
        ephemeral: true
      });
    } else {
      return interaction.reply({
        embeds: [embed],
        components: [buttons],
        ephemeral: true
      });
    }
  }
};
