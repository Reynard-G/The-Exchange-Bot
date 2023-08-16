const fs = require("fs");
const chalk = require("chalk");

const { PermissionsBitField } = require("discord.js");
const { Routes } = require("discord-api-types/v10");
const { REST } = require("@discordjs/rest");

const AsciiTable = require("ascii-table");
const table = new AsciiTable().setHeading("Slash Commands", "Stats").setBorder("|", "=", "0", "0");

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const rest = new REST({ version: "10" }).setToken(TOKEN);

module.exports = (client) => {
	const slashCommands = [];

	fs.readdirSync("./slashCommands/").forEach(async dir => {
		if (dir === "subCommands") {
			fs.readdirSync("./slashCommands/subCommands").filter(file => !file.endsWith(".js")).forEach(async subdir => {
				const subFiles = fs.readdirSync(`./slashCommands/subCommands/${subdir}/`).filter(file => file.endsWith(".js"));
				for (const file of subFiles) {
					const subCommand = require(`../slashCommands/subCommands/${subdir}/${file}`);
					client.subCommands.set(`${subdir} ${subCommand.name}`, subCommand);
				}

				const subFolders = fs.readdirSync(`./slashCommands/subCommands/${subdir}/`).filter(file => !file.endsWith(".js"));
				for (const folder of subFolders) {
					const subFiles = fs.readdirSync(`./slashCommands/subCommands/${subdir}/${folder}/`).filter(file => file.endsWith(".js"));
					for (const file of subFiles) {
						const subCommand = require(`../slashCommands/subCommands/${subdir}/${folder}/${file}`);
						client.subCommands.set(`${subdir} ${folder} ${subCommand.name}`, subCommand);
					}
				}
			});
		}

		const files = fs.readdirSync(`./slashCommands/${dir}/`).filter(file => file.endsWith(".js"));
		for (const file of files) {
			const slashCommand = require(`../slashCommands/${dir}/${file}`);
			slashCommands.push({
				name: slashCommand.name,
				description: slashCommand.description,
				type: slashCommand.type,
				options: slashCommand.options ? slashCommand.options : null,
				dm_permission: slashCommand.dm_permission ?? null,
				default_permission: slashCommand.default_permission ? slashCommand.default_permission : null,
				default_member_permissions: slashCommand.default_member_permissions ? PermissionsBitField.resolve(slashCommand.default_member_permissions).toString() : null
			});

			if (slashCommand.name) {
				client.slashCommands.set(slashCommand.name, slashCommand);
				table.addRow(file.split(".js")[0], "✅");
			} else {
				table.addRow(file.split(".js")[0], "⛔");
			}
		}

	});

	console.log(chalk.red(table.toString()));

	(async () => {
		try {
			await rest.put(
				Routes.applicationCommands(CLIENT_ID),
				{ body: slashCommands }
			);
			console.log(chalk.yellow("Slash Commands • Registered"));
		} catch (error) {
			client.logger.error(error.stack);
		}
	})();
};
