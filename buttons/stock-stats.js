const { EmbedBuilder } = require("discord.js");
const Decimal = require("decimal.js-light");
const { DateTime } = require("luxon");

module.exports = {
  id: "stock:stats",
  permissions: [],
  run: async (client, interaction) => {
    // Defer update in case it takes a while
		await interaction.deferUpdate();

    const ticker = interaction.message.embeds[0].fields[0].value;
    const marketOpen = DateTime.fromObject({ hour: 0, minute: 0 }, { zone: "America/New_York" });

    const tickData = await client.stocks.getTickData(ticker, marketOpen.toSeconds(), DateTime.utc().toSeconds());
    const ohlcData = tickData.length > 0 ? client.utils.resampleTicksByTime(tickData, DateTime.fromObject({ day: 1 }).toSeconds())[0] : null;

    // Today's Open
    const open = ohlcData ? client.utils.formatCurrency(ohlcData.o) : "N/A";

    // Today's High
    const high = ohlcData ? client.utils.formatCurrency(ohlcData.h) : "N/A";

    // Today's Low
    const low = ohlcData ? client.utils.formatCurrency(ohlcData.l) : "N/A";

    // Market Cap
    const tickerData = (await client.stocks.ticker(ticker));
    const marketCap = new Decimal(tickerData.price).mul(tickerData.total_outstanding_shares).toNumber();

    // P/B Ratio
    const bookValue = await client.stocks.bookValue(ticker);
    const pbRatio = bookValue === 0 ? "Unknown" : new Decimal(marketCap).div(bookValue).toNumber().toFixed(2);

    const embed = new EmbedBuilder()
      .setTitle(`${ticker} Stock Stats`)
      .setDescription(`Statistics for **${ticker}** stock.`)
      .addFields(
        { name: "Today's Open", value: open },
        { name: "Today's High", value: high },
        { name: "Today's Low", value: low },
        { name: "Market Cap", value: client.utils.formatCurrency(marketCap) },
        { name: "P/B Ratio", value: pbRatio },
      )
      .setColor("#BB8FCE")
      .setTimestamp()
      .setFooter({ text: "The Exchange  •  Invest in the future", iconURL: interaction.guild.iconURL() });

    return interaction.editReply({
      embeds: [embed],
      attachments: [],
      components: [],
      ephemeral: true
    });
  }
};