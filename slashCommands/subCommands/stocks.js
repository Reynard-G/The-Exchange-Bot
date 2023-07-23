const { ApplicationCommandType, ApplicationCommandOptionType } = require("discord.js");

module.exports = {
  name: "stocks",
  description: "Stocks related commands.",
  type: ApplicationCommandType.ChatInput,
  dm_permission: false,
  cooldown: 3000,
  options: [
    {
      name: "info",
      description: "Get information about a stock.",
      type: ApplicationCommandOptionType.Subcommand,
      cooldown: 3000,
      options: [
        {
          name: "ticker",
          description: "The ticker of the stock you want to get information about.",
          type: ApplicationCommandOptionType.String,
          required: true,
          max_length: 5,
        },
      ],
    },
    {
      name: "countdown",
      description: "Get the countdown to the next market day.",
      type: ApplicationCommandOptionType.Subcommand,
      cooldown: 3000,
    },
  ],
};