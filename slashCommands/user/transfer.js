const { EmbedBuilder, ApplicationCommandType, ApplicationCommandOptionType } = require("discord.js");
const { NoParametersError } = require("../../structs/Errors.js");

module.exports = {
  name: "transfer",
  description: "Transfer money/shares to another user.",
  cooldown: 3000,
  dm_permission: false,
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "user",
      description: "The user to transfer money to.",
      type: ApplicationCommandOptionType.User,
      required: true
    },
    {
      name: "money_amount",
      description: "The amount of money to transfer.",
      type: ApplicationCommandOptionType.Integer,
      required: false
    },
    {
      name: "ticker",
      description: "The ticker of the stock to transfer shares of.",
      type: ApplicationCommandOptionType.String,
      required: false
    },
    {
      name: "shares_amount",
      description: "The amount of shares to transfer.",
      type: ApplicationCommandOptionType.Integer,
      required: false
    }
  ],
  run: async (client, interaction) => {
    const user = interaction.options.getUser("user");
    const money_amount = interaction.options.getInteger("money_amount");
    const ticker = interaction.options.getString("ticker")?.toUpperCase();
    const shares_amount = interaction.options.getInteger("shares_amount");

    if (!money_amount && (!ticker || !shares_amount)) {
      throw new NoParametersError("You must specify either a money amount or a ticker and shares amount.");
    } else if (money_amount && (ticker || shares_amount)) {
      throw new NoParametersError("You cannot specify both a money amount and a ticker and shares amount.");
    }

    const embed = new EmbedBuilder()
      .setTitle("Transfer")
      .setFields(
        { name: "From", value: `${interaction.user}` },
        { name: "To", value: `${user}` }
      )
      .setColor("#BB8FCE")
      .setTimestamp()
      .setFooter({ text: "The Exchange  •  Invest in the future", iconURL: interaction.guild.iconURL() });

    if (money_amount) {
      await client.account.transferMoney(interaction.user.id, user.id, money_amount);

      embed.addFields(
        { name: "Amount", value: `**${client.utils.formatCurrency(money_amount)}**` }
      );
    }

    if (ticker && shares_amount) {
      await client.account.transferShares(interaction.user.id, user.id, ticker, shares_amount);

      embed.addFields(
        { name: "Ticker", value: `${ticker}` },
        { name: "Amount", value: `**${shares_amount}**` }
      );
    }

    return interaction.reply({ embeds: [embed] });
  }
};