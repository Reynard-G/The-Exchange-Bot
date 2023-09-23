const { EmbedBuilder } = require("discord.js");
const Decimal = require("decimal.js-light");
const { DateTime } = require("luxon");

module.exports = {
  id: "stock:stats",
  permissions: [],
  run: async (client, interaction) => {
    const ticker = interaction.message.embeds[0].fields[0].value;
    const marketOpen = DateTime.fromObject({ hour: 0, minute: 0 }, { zone: "America/New_York" });

    const tickData = await client.stocks.getTickData(ticker, marketOpen.toSeconds(), DateTime.utc().toSeconds());
    const ohlcData = client.utils.convertToOHLC(tickData, DateTime.fromObject({ day: 1 }).toMillis())[0];

    // Today's Open
    const open = client.utils.formatCurrency(ohlcData.o);

    // Today's High
    const high = client.utils.formatCurrency(ohlcData.h);

    // Today's Low
    const low = client.utils.formatCurrency(ohlcData.l);

    // Market Cap
    const tickerData = (await client.stocks.ticker(ticker));
    const marketCap = new Decimal(tickerData.price).mul(tickerData.total_outstanding_shares).toNumber();

    // P/B Ratio
    const bookValue = await client.stocks.bookValue(ticker);
    const pbRatio = new Decimal(marketCap).div(bookValue).toNumber();

    const embed = new EmbedBuilder()
      .setTitle(`${ticker} Stock Stats`)
      .setDescription(`Statistics for **${ticker}** stock.`)
      .addFields(
        { name: "Today's Open", value: open },
        { name: "Today's High", value: high },
        { name: "Today's Low", value: low },
        { name: "Market Cap", value: client.utils.formatCurrency(marketCap) },
        { name: "P/B Ratio", value: pbRatio.toFixed(2) },
      )
      .setColor("#BB8FCE")
      .setTimestamp()
      .setFooter({ text: "The Exchange  •  Invest in the future", iconURL: interaction.guild.iconURL() });

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};