const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { Duration } = require("luxon");

module.exports = {
	id: "stock:charts",
	permissions: [],
	run: async (client, interaction) => {
		// Disable buttons if ticker doesn't go back that far
		const ticks = await client.stocks.getTickData(interaction.message.embeds[0].fields[0].value, 0, new Date().getTime());
		const oldestTick = ticks[0];
		const isOlderThan = (duration) => oldestTick.time > new Date().getTime() - duration.as("milliseconds");

		const intervalButtons = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId("stock:charts:1d")
					.setLabel("1 Day")
					.setStyle(isOlderThan(Duration.fromObject({ days: 1 })) ? ButtonStyle.Danger : ButtonStyle.Secondary)
					.setDisabled(isOlderThan(Duration.fromObject({ days: 1 }))),
				new ButtonBuilder()
					.setCustomId("stock:charts:1w")
					.setLabel("1 Week")
					.setStyle(isOlderThan(Duration.fromObject({ weeks: 1 })) ? ButtonStyle.Danger : ButtonStyle.Secondary)
					.setDisabled(isOlderThan(Duration.fromObject({ weeks: 1 }))),
				new ButtonBuilder()
					.setCustomId("stock:charts:1m")
					.setLabel("1 Month")
					.setStyle(isOlderThan(Duration.fromObject({ months: 1 })) ? ButtonStyle.Danger : ButtonStyle.Secondary)
					.setDisabled(isOlderThan(Duration.fromObject({ months: 1 }))),
				new ButtonBuilder()
					.setCustomId("stock:charts:3m")
					.setLabel("3 Months")
					.setStyle(isOlderThan(Duration.fromObject({ months: 3 })) ? ButtonStyle.Danger : ButtonStyle.Secondary)
					.setDisabled(isOlderThan(Duration.fromObject({ months: 3 }))),
				new ButtonBuilder()
					.setCustomId("stock:charts:6m")
					.setLabel("6 Months")
					.setStyle(isOlderThan(Duration.fromObject({ months: 6 })) ? ButtonStyle.Danger : ButtonStyle.Secondary)
					.setDisabled(isOlderThan(Duration.fromObject({ months: 6 }))),
			);

		const infIntervalButton = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId("stock:charts:all")
					.setLabel("All")
					.setStyle(ButtonStyle.Danger)
					.setDisabled(true),
			);

		return interaction.update({
			components: [intervalButtons, infIntervalButton]
		});
	}
};
