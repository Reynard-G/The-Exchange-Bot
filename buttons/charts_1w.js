const { EmbedBuilder, ActionRowBuilder } = require("discord.js");
const { DateTime, Duration } = require("luxon");
const QuickChart = require("quickchart-js");

module.exports = {
  id: "stock:charts:1w",
  permissions: [],
  run: async (client, interaction) => {
    const ticker = interaction.message.embeds[0].fields[0].value;
    const data = await client.stocks.getTickData(ticker, DateTime.utc().minus({ weeks: 1 }).toSeconds(), DateTime.utc().toSeconds());
    const ohlc = client.utils.convertToOHLC(data, Duration.fromObject({ hours: 7 }).minus({ minutes: 1 }).as("milliseconds"));

    const chart = new QuickChart();
    chart.setWidth(500);
    chart.setHeight(300);
    chart.setVersion(3);
    chart.setConfig({
      type: "candlestick",
      data: {
        datasets: [{
          label: ticker,
          data: ohlc,
        }]
      },
      options: {
        scales: {
          x: {
            adapters: {
              date: {
                zone: "UTC-4"
              }
            },
            time: {
              unit: "day",
              displayFormats: {
                day: "MMM d"
              },
              tooltipFormat: "MMM d"
            },
            ticks: {
              autoSkip: true,
            },
          },
          y: {
            ticks: {
              callback: (label) => `${Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(label)}`
            },
          }
        }
      }
    });

    // Update disabled buttons
    const intervalButtons = ActionRowBuilder.from(interaction.message.components[0]);
    const infIntervalButton = ActionRowBuilder.from(interaction.message.components[1]);
    
    intervalButtons.components.forEach((button) => {
      if (button.data.style === 2) button.setDisabled(false);
    });
    infIntervalButton.components.forEach((button) => {
      if (button.data.style === 2) button.setDisabled(false);
    });

    intervalButtons.components[1].setDisabled(true);

    const embed = EmbedBuilder.from(interaction.message.embeds[0]);
    embed.setImage(`attachment://${ticker}.png`);

    return interaction.update({
      embeds: [embed],
      components: [intervalButtons, infIntervalButton],
      files: [{
        name: `${ticker}.png`,
        attachment: await chart.toBinary()
      }]
    });
  }
};