const { EmbedBuilder, ApplicationCommandType, ApplicationCommandOptionType } = require("discord.js");
const { InsufficientPermissionsError } = require("../../structs/Errors.js");

module.exports = {
  name: "shareholders",
  description: "View the top 5 shareholders of a company.",
  cooldown: 3000,
  dm_permission: false,
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "ticker",
      description: "The ticker of the company to view the shareholders of.",
      type: ApplicationCommandOptionType.String,
      required: true
    }
  ],
  run: async (client, interaction) => {
    const ticker = interaction.options.getString("ticker")?.toUpperCase();

    const hasExchangePlus = await client.account.hasExchangePlus(interaction.user.id);
    if (!hasExchangePlus) throw new InsufficientPermissionsError(interaction.user.id, "You must have Exchange+ to use this command.");

    const shareholders = (await client.stocks.shareholders(ticker)).slice(0, 5);

    const embed = new EmbedBuilder()
      .setTitle("Shareholders")
      .setColor("#BB8FCE")
      .setTimestamp()
      .setFooter({ text: "The Exchange  •  Invest in the future", iconURL: interaction.guild.iconURL() });

    if (shareholders.length === 0) {
      embed.setDescription(`There are no shareholders for **${ticker}**.`);
    } else {
      embed.setDescription(`Shareholders for **${ticker}**:`);
      embed.setFields(
        shareholders.map((shareholder) => {
          return {
            name: `${shareholder.username}`,
            value: `${shareholder.shares} share(s)`
          };
        })
      );
    }

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};