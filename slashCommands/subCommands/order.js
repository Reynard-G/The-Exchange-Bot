const { ApplicationCommandType, ApplicationCommandOptionType } = require("discord.js");

module.exports = {
  name: "order",
  description: "Order type related commands.",
  type: ApplicationCommandType.ChatInput,
  dm_permission: false,
  cooldown: 3000,
  options: [
    {
      name: "market",
      description: "Market order related commands.",
      type: ApplicationCommandOptionType.SubcommandGroup,
      cooldown: 3000,
      options: [
        {
          name: "buy",
          description: "Buy shares of a stock.",
          type: ApplicationCommandOptionType.Subcommand,
          cooldown: 3000,
          options: [
            {
              name: "ticker",
              description: "The ticker of the stock you want to buy.",
              type: ApplicationCommandOptionType.String,
              required: true,
              max_length: 5,
            },
            {
              name: "amount",
              description: "The amount of shares you want to buy.",
              type: ApplicationCommandOptionType.Integer,
              required: true,
              min_value: 1,
            },
            {
              name: "collar_percentage",
              description: "The maximum percentage you are willing to pay for the stock. Default is 5%.",
              type: ApplicationCommandOptionType.Number,
              required: false,
              min_value: 0,
              max_value: 100,
            },
          ],
        },
        {
          name: "sell",
          description: "Sell shares of a stock.",
          type: ApplicationCommandOptionType.Subcommand,
          cooldown: 3000,
          options: [
            {
              name: "ticker",
              description: "The ticker of the stock you want to sell.",
              type: ApplicationCommandOptionType.String,
              required: true,
              max_length: 5,
            },
            {
              name: "amount",
              description: "The amount of shares you want to sell.",
              type: ApplicationCommandOptionType.Integer,
              required: true,
              min_value: 1,
            },
            {
              name: "collar_percentage",
              description: "The minimum percentage you are willing to sell the stock for. Default is 5%.",
              type: ApplicationCommandOptionType.Number,
              required: false,
              min_value: 0,
              max_value: 100,
            }
          ],
        },
      ],
    },
    {
      name: "limit",
      description: "Limit order related commands.",
      type: ApplicationCommandOptionType.SubcommandGroup,
      cooldown: 3000,
      options: [
        {
          name: "buy",
          description: "Buy shares of a stock.",
          type: ApplicationCommandOptionType.Subcommand,
          cooldown: 3000,
          options: [
            {
              name: "ticker",
              description: "The ticker of the stock you want to buy.",
              type: ApplicationCommandOptionType.String,
              required: true,
              max_length: 5,
            },
            {
              name: "amount",
              description: "The amount of shares you want to buy.",
              type: ApplicationCommandOptionType.Integer,
              required: true,
              min_value: 1,
            },
            {
              name: "max_price",
              description: "The maximum price you are willing to pay for the stock.",
              type: ApplicationCommandOptionType.Number,
              required: true,
              min_value: 0.0001,
            },
          ],
        },
        {
          name: "sell",
          description: "Sell shares of a stock.",
          type: ApplicationCommandOptionType.Subcommand,
          cooldown: 3000,
          options: [
            {
              name: "ticker",
              description: "The ticker of the stock you want to sell.",
              type: ApplicationCommandOptionType.String,
              required: true,
              max_length: 5,
            },
            {
              name: "amount",
              description: "The amount of shares you want to sell.",
              type: ApplicationCommandOptionType.Integer,
              required: true,
              min_value: 1,
            },
            {
              name: "min_price",
              description: "The minimum price you are willing to sell the stock for.",
              type: ApplicationCommandOptionType.Number,
              required: true,
              min_value: 0.0001,
            },
          ],
        },
      ],
    },
    {
      name: "cancel",
      description: "Cancel an order.",
      type: ApplicationCommandOptionType.Subcommand,
      cooldown: 3000,
      options: [
        {
          name: "order_id",
          description: "The ID of the order you want to cancel.",
          type: ApplicationCommandOptionType.Integer,
          required: true,
          min_value: 1,
        },
      ],
    },
  ],
};