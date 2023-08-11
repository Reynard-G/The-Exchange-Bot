const { EmbedBuilder, Collection, PermissionsBitField } = require("discord.js");
const { NotRegisteredError } = require("../structs/Errors.js");
const Account = require("../structs/Account.js");
const moment = require("moment");
const client = require("..");

const cooldown = new Collection();

client.on("interactionCreate", async interaction => {
	const slashCommand = client.slashCommands.get(interaction.commandName);

	if (interaction.type === 4) {
		if (slashCommand.autocomplete) {
			const choices = [];
			await slashCommand.autocomplete(interaction, choices);
		}
	}
	if (!interaction.type === 2) return;
	if (!slashCommand) return client.slashCommands.delete(interaction.commandName);

	// If the command is a subcommand, get the subcommand
	// If the command has a subcommand group, get the subcommand group aswell
	const subCommand = interaction.options.getSubcommand(false);
	const subCommandGroup = interaction.options.getSubcommandGroup(false);

	let subCommandGroupOption, subCommandOption;
	if (subCommandGroup) {
		subCommandGroupOption = client.subCommands.get(`${interaction.commandName} ${subCommandGroup} ${subCommand}`, subCommand);
	} else if (subCommand) {
		subCommandOption = client.subCommands.get(`${interaction.commandName} ${subCommand}`, subCommand);
	}

	// Logging
	const utcDateTime = new Date().toUTCString().substring(5);
	if (subCommandGroup) {
		console.log(`${utcDateTime} ${interaction.user.tag} (${interaction.user.id})`, slashCommand.name, subCommandGroup, subCommand);
	} else if (subCommand) {
		console.log(`${utcDateTime} ${interaction.user.tag} (${interaction.user.id})`, slashCommand.name, subCommand);
	} else {
		console.log(`${utcDateTime} ${interaction.user.tag} (${interaction.user.id})`, slashCommand.name);
	}

	try {
		if (slashCommand.cooldown) {
			if (cooldown.has(`slash-${slashCommand.name}${interaction.user.id}`)) {
				const cooldownEmbed = new EmbedBuilder()
					.setTitle("Cooldown")
					.setDescription(`You are currently on cooldown. Please wait **${moment.duration(cooldown.get(`slash-${slashCommand.name}${interaction.user.id}`) - Date.now()).asSeconds()}s**.`)
					.setColor("Red")
					.setTimestamp()
					.setFooter({ text: `The Exchange`, iconURL: interaction.user.displayAvatarURL() });

				return interaction.reply({ embeds: [cooldownEmbed], ephemeral: true });
			}
			cooldown.set(`slash-${slashCommand.name}${interaction.user.id}`, Date.now() + slashCommand.cooldown);
			setTimeout(() => {
				cooldown.delete(`slash-${slashCommand.name}${interaction.user.id}`);
			}, slashCommand.cooldown);
		}

		if (slashCommand.userPerms || slashCommand.botPerms) {
			if (!interaction.memberPermissions.has(PermissionsBitField.resolve(slashCommand.userPerms || []))) {
				const userPerms = new EmbedBuilder()
					.setDescription(`🚫 ${interaction.user}, You don't have \`${slashCommand.userPerms}\` permissions to use this command!`)
					.setColor("Red");
				return interaction.reply({ embeds: [userPerms], ephemeral: true });
			}
			if (!interaction.guild.members.cache.get(client.user.id).permissions.has(PermissionsBitField.resolve(slashCommand.botPerms || []))) {
				const botPerms = new EmbedBuilder()
					.setDescription(`🚫 ${interaction.user}, I don't have \`${slashCommand.botPerms}\` permissions to use this command!`)
					.setColor("Red");
				return interaction.reply({ embeds: [botPerms] });
			}

		}

		try {
			const account = new Account();
			const isRegistered = await account.isRegistered(interaction.user.id);

			if (!isRegistered) throw new NotRegisteredError(interaction.user.id);

			if (subCommandGroupOption) {
				await subCommandGroupOption.run(client, interaction);
			} else if (subCommandOption) {
				await subCommandOption.run(client, interaction);
			} else {
				await slashCommand.run(client, interaction);
			}
		} catch (error) {
			if (error.name === "InvalidStockTickerError") {
        console.warn(`${interaction.user.tag} (${interaction.user.id}) provided an invalid stock ticker.`);
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Invalid Stock Ticker")
              .setDescription(`The stock ticker you've provided is invalid.`)
              .setColor("Red")
              .setTimestamp()
              .setFooter({ text: "The Exchange  •  Invest in the future", iconURL: interaction.guild.iconURL() })
          ],
          ephemeral: true
        });
      } else if (error.name === "FrozenStockError") {
        console.warn(`${interaction.user.tag} (${interaction.user.id}) tried to access a frozen stock.`);
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Frozen Stock")
              .setDescription(`The stock you've provided is currently **frozen**.`)
              .setColor("Red")
              .setTimestamp()
              .setFooter({ text: "The Exchange  •  Invest in the future", iconURL: interaction.guild.iconURL() })
          ],
          ephemeral: true
        });
      } else if (error.name === "FrozenUserError") {
        console.warn(`${interaction.user.tag} (${interaction.user.id}) tried to access a frozen user.`);
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Frozen User")
              .setDescription(`You're account is currently **frozen**.`)
              .setColor("Red")
              .setTimestamp()
              .setFooter({ text: "The Exchange  •  Invest in the future", iconURL: interaction.guild.iconURL() })
          ],
          ephemeral: true
        });
			} else if (error.name === "InsufficientPermissionsError") {
				console.warn(`${interaction.user.tag} (${interaction.user.id}) tried to access a command without the required permissions.`);
				await interaction.reply({
					embeds: [
						new EmbedBuilder()
							.setTitle("Insufficient Permissions")
							.setDescription(`You don't have the required permissions to perform this action.`)
							.setColor("Red")
							.setTimestamp()
							.setFooter({ text: "The Exchange  •  Invest in the future", iconURL: interaction.guild.iconURL() })
					],
					ephemeral: true
				});
      } else if (error.name === "InsufficientFundsError") {
        console.warn(`${interaction.user.tag} (${interaction.user.id}) tried to use a command without enough funds.`);
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Insufficient Funds")
              .setDescription(`You don't have enough funds to complete this transaction.`)
              .setColor("Red")
              .setTimestamp()
              .setFooter({ text: "The Exchange  •  Invest in the future", iconURL: interaction.guild.iconURL() })
          ],
          ephemeral: true
        });
			} else if (error.name === "InvalidSharesAmountError") {
				console.warn(`${interaction.user.tag} (${interaction.user.id}) provided an invalid amount of shares.`);
				await interaction.reply({
					embeds: [
						new EmbedBuilder()
							.setTitle("Invalid Shares Amount")
							.setDescription(`The amount of shares you've provided is invalid.`)
							.setColor("Red")
							.setTimestamp()
							.setFooter({ text: "The Exchange  •  Invest in the future", iconURL: interaction.guild.iconURL() })
					],
					ephemeral: true
				});
			} else if (error.name === "InvalidLimitPriceError") {
				console.warn(`${interaction.user.tag} (${interaction.user.id}) provided an invalid limit price.`);
				await interaction.reply({
					embeds: [
						new EmbedBuilder()
							.setTitle("Invalid Limit Price")
							.setDescription(`The limit price you've provided is invalid.`)
							.setColor("Red")
							.setTimestamp()
							.setFooter({ text: "The Exchange  •  Invest in the future", iconURL: interaction.guild.iconURL() })
					],
					ephemeral: true
				});
			} else if (error.name === "NotRegisteredError") {
				console.warn(`${interaction.user.tag} (${interaction.user.id}) tried to access a command without being registered.`);
				await interaction.reply({
					embeds: [
						new EmbedBuilder()
							.setTitle("Not Registered")
							.setDescription(`You're not registered yet. Please open a brokerage account to use this command.`)
							.setColor("Red")
							.setTimestamp()
							.setFooter({ text: "The Exchange  •  Invest in the future", iconURL: interaction.guild.iconURL() })
					],
					ephemeral: true
				});
			} else if (error.name === "AlreadyRegisteredError") {
				console.warn(`${interaction.user.tag} (${interaction.user.id}) tried to register an account while already being registered.`);
				await interaction.reply({
					embeds: [
						new EmbedBuilder()
							.setTitle("Already Registered")
							.setDescription(`The user is already registered.`)
							.setColor("Red")
							.setTimestamp()
							.setFooter({ text: "The Exchange  •  Invest in the future", iconURL: interaction.guild.iconURL() })
					],
					ephemeral: true
				});
			} else if (error.name === "OrderNotFoundError") {
				console.warn(`${interaction.user.tag} (${interaction.user.id}) tried to access an order that doesn't exist.`);
				await interaction.reply({
					embeds: [
						new EmbedBuilder()
							.setTitle("Order Not Found")
							.setDescription(`The order you've provided was not found.`)
							.setColor("Red")
							.setTimestamp()
							.setFooter({ text: "The Exchange  •  Invest in the future", iconURL: interaction.guild.iconURL() })
					],
					ephemeral: true
				});
			} else if (error.name === "ImageTooLargeError") {
				console.warn(`${interaction.user.tag} (${interaction.user.id}) tried to upload an image that was too large.`);
				await interaction.reply({
					embeds: [
						new EmbedBuilder()
							.setTitle("Image Too Large")
							.setDescription(`The image you've provided is too large.`)
							.setColor("Red")
							.setTimestamp()
							.setFooter({ text: "The Exchange  •  Invest in the future", iconURL: interaction.guild.iconURL() })
					],
					ephemeral: true
				});
      } else {
        console.error(error);
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Unexpected Error")
              .setDescription(`An unexpected error occurred, please try again later.`)
              .setColor("Red")
              .setTimestamp()
              .setFooter({ text: "The Exchange  •  Invest in the future", iconURL: interaction.guild.iconURL() })
          ],
          ephemeral: true
        });
      }
		}
	} catch (error) {
		console.error(error);
	}
});