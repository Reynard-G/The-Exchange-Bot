const { ActivityType } = require("discord.js");
const client = require("..");
const chalk = require("chalk");

client.on("ready", () => {
	const activities = [
		{ name: `with money`, type: ActivityType.Playing },
		{ name: `the stock market`, type: ActivityType.Watching },
		{ name: `the news`, type: ActivityType.Listening },
		{ name: `time pass`, type: ActivityType.Watching },
	];

	let i = 0;
	setInterval(() => {
		if (i >= activities.length) i = 0;
		client.user.setActivity(activities[i]);
		i++;
	}, 5000);

	client.user.setStatus("dnd");

	console.log(chalk.red(`Logged in as ${client.user.tag}!`));
});