const { ApplicationCommandType, ApplicationCommandOptionType } = require("discord.js");

module.exports = {
  name: "admin",
  description: "Admin related commands.",
  type: ApplicationCommandType.ChatInput,
  default_member_permissions: "Administrator",
  dm_permission: false,
  cooldown: 3000,
  options: [
    {
      name: "traders",
      description: "View a list of traders.",
      type: ApplicationCommandOptionType.Subcommand,
      cooldown: 3000,
    },
    {
      name: "user",
      description: "Admin related commands for a user.",
      type: ApplicationCommandOptionType.SubcommandGroup,
      cooldown: 3000,
      options: [
        {
          name: "freeze",
          description: "Freeze a user's account.",
          type: ApplicationCommandOptionType.Subcommand,
          cooldown: 3000,
          options: [
            {
              name: "user",
              description: "The user you want to freeze.",
              type: ApplicationCommandOptionType.User,
              required: true,
            },
          ],
        },
        {
          name: "unfreeze",
          description: "Unfreeze a user's account.",
          type: ApplicationCommandOptionType.Subcommand,
          cooldown: 3000,
          options: [
            {
              name: "user",
              description: "The user you want to unfreeze.",
              type: ApplicationCommandOptionType.User,
              required: true,
            },
          ],
        },
        {
          name: "balance",
          description: "View a user's balance.",
          type: ApplicationCommandOptionType.Subcommand,
          cooldown: 3000,
          options: [
            {
              name: "user",
              description: "The user you want to view the balance of.",
              type: ApplicationCommandOptionType.User,
              required: true,
            },
          ],
        },
        {
          name: "orders",
          description: "View a user's orders.",
          type: ApplicationCommandOptionType.Subcommand,
          cooldown: 3000,
          options: [
            {
              name: "user",
              description: "The user you want to view the orders of.",
              type: ApplicationCommandOptionType.User,
              required: true,
            },
          ],
        },
        {
          name: "portfolio",
          description: "View a user's portfolio.",
          type: ApplicationCommandOptionType.Subcommand,
          cooldown: 3000,
          options: [
            {
              name: "user",
              description: "The user you want to view the portfolio of.",
              type: ApplicationCommandOptionType.User,
              required: true,
            },
          ],
        },
        {
          name: "register",
          description: "Register a user.",
          type: ApplicationCommandOptionType.Subcommand,
          cooldown: 3000,
          options: [
            {
              name: "user",
              description: "The user you want to register.",
              type: ApplicationCommandOptionType.User,
              required: true,
            },
            {
              name: "username",
              description: "The username you want to register the user with.",
              type: ApplicationCommandOptionType.String,
              required: true,
              min_length: 3,
              max_length: 16,
            },
          ],
        },
        {
          name: "transactions",
          description: "View a user's transactions.",
          type: ApplicationCommandOptionType.Subcommand,
          cooldown: 3000,
          options: [
            {
              name: "user",
              description: "The user you want to view the transactions of.",
              type: ApplicationCommandOptionType.User,
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: "stock",
      description: "Admin related commands for a stock.",
      type: ApplicationCommandOptionType.SubcommandGroup,
      cooldown: 3000,
      options: [
        {
          name: "freeze",
          description: "Freeze a stock.",
          type: ApplicationCommandOptionType.Subcommand,
          cooldown: 3000,
          options: [
            {
              name: "ticker",
              description: "The ticker of the stock you want to freeze.",
              type: ApplicationCommandOptionType.String,
              required: true,
              max_length: 10,
            },
          ],
        },
        {
          name: "unfreeze",
          description: "Unfreeze a stock.",
          type: ApplicationCommandOptionType.Subcommand,
          cooldown: 3000,
          options: [
            {
              name: "ticker",
              description: "The ticker of the stock you want to unfreeze.",
              type: ApplicationCommandOptionType.String,
              required: true,
              max_length: 10,
            },
          ],
        },
        {
          name: "delist",
          description: "Delist a stock.",
          type: ApplicationCommandOptionType.Subcommand,
          cooldown: 3000,
          options: [
            {
              name: "ticker",
              description: "The ticker of the stock you want to delist.",
              type: ApplicationCommandOptionType.String,
              required: true,
              max_length: 10,
            },
          ],
        },
        {
          name: "relist",
          description: "Relist a stock.",
          type: ApplicationCommandOptionType.Subcommand,
          cooldown: 3000,
          options: [
            {
              name: "ticker",
              description: "The ticker of the stock you want to relist.",
              type: ApplicationCommandOptionType.String,
              required: true,
              max_length: 10,
            },
          ],
        },
        {
          name: "create",
          description: "Create a stock.",
          type: ApplicationCommandOptionType.Subcommand,
          cooldown: 3000,
          options: [
            {
              name: "ticker",
              description: "The ticker of the stock you want to create.",
              type: ApplicationCommandOptionType.String,
              required: true,
              max_length: 10,
            },
            {
              name: "name",
              description: "The name of the company for the stock you want to create.",
              type: ApplicationCommandOptionType.String,
              required: true,
              max_length: 100,
            },
            {
              name: "available_shares",
              description: "The amount of (public) shares available for trading for the stock you want to create.",
              type: ApplicationCommandOptionType.Integer,
              required: true,
              min_value: 0,
            },
            {
              name: "outstanding_shares",
              description: "The amount of (public) shares outstanding for the stock you want to create.",
              type: ApplicationCommandOptionType.Integer,
              required: true,
              min_value: 1,
            },
            {
              name: "total_outstanding_shares",
              description: "The total amount of (private & public) shares outstanding for the stock you want to create.",
              type: ApplicationCommandOptionType.Integer,
              required: true,
              min_value: 1,
            },
            {
              name: "price",
              description: "The price per share of the stock you want to create.",
              type: ApplicationCommandOptionType.Number,
              required: true,
              min_value: 0.0001,
            },
          ],
        },
        {
          name: "price",
          description: "Set the price of a stock.",
          type: ApplicationCommandOptionType.Subcommand,
          cooldown: 3000,
          options: [
            {
              name: "ticker",
              description: "The ticker of the stock you want to set the price of.",
              type: ApplicationCommandOptionType.String,
              required: true,
              max_length: 10,
            },
            {
              name: "price",
              description: "The price per share of the stock you want to set.",
              type: ApplicationCommandOptionType.Number,
              required: true,
              min_value: 0.0001,
            },
          ],
        },
        {
          name: "setimage",
          description: "Set the image of a stock.",
          type: ApplicationCommandOptionType.Subcommand,
          cooldown: 3000,
          options: [
            {
              name: "ticker",
              description: "The ticker of the stock you want to set the image of.",
              type: ApplicationCommandOptionType.String,
              required: true,
              max_length: 10,
            },
            {
              name: "image",
              description: "The image of the stock you want to set.",
              type: ApplicationCommandOptionType.Attachment,
              required: true,
            },
          ],
        },
        {
          name: "available_shares",
          description: "Change the amount of available share (public) for a stock.",
          type: ApplicationCommandOptionType.Subcommand,
          cooldown: 3000,
          options: [
            {
              name: "ticker",
              description: "The ticker of the stock you want to change the amount of available shares for.",
              type: ApplicationCommandOptionType.String,
              required: true,
              max_length: 10,
            },
            {
              name: "amount",
              description: "The amount of available shares you want to set.",
              type: ApplicationCommandOptionType.Integer,
              required: true,
              min_value: 0,
            },
          ],
        },
        {
          name: "outstanding_shares",
          description: "Change the amount of outstanding share (public) for a stock.",
          type: ApplicationCommandOptionType.Subcommand,
          cooldown: 3000,
          options: [
            {
              name: "ticker",
              description: "The ticker of the stock you want to change the amount of outstanding shares for.",
              type: ApplicationCommandOptionType.String,
              required: true,
              max_length: 10,
            },
            {
              name: "amount",
              description: "The amount of outstanding shares you want to set.",
              type: ApplicationCommandOptionType.Integer,
              required: true,
              min_value: 1,
            },
          ],
        },
        {
          name: "total_outstanding_shares",
          description: "Change the total amount of outstanding share (private & public) for a stock.",
          type: ApplicationCommandOptionType.Subcommand,
          cooldown: 3000,
          options: [
            {
              name: "ticker",
              description: "The ticker of the stock you want to change the total amount of outstanding shares for.",
              type: ApplicationCommandOptionType.String,
              required: true,
              max_length: 10,
            },
            {
              name: "amount",
              description: "The total amount of outstanding shares you want to set.",
              type: ApplicationCommandOptionType.Integer,
              required: true,
              min_value: 1,
            },
          ],
        },
        {
          name: "shareholders",
          description: "View a stock's shareholders.",
          type: ApplicationCommandOptionType.Subcommand,
          cooldown: 3000,
          options: [
            {
              name: "ticker",
              description: "The ticker of the stock you want to view the shareholders of.",
              type: ApplicationCommandOptionType.String,
              required: true,
              max_length: 10,
            },
          ],
        },
        {
          name: "valuation",
          description: "Set a stock's valuation.",
          type: ApplicationCommandOptionType.Subcommand,
          cooldown: 3000,
          options: [
            {
              name: "ticker",
              description: "The ticker of stock you want to set the valuation of.",
              type: ApplicationCommandOptionType.String,
              required: true,
              max_length: 10,
            },
            {
              name: "amount",
              description: "The valuation you want to set.",
              type: ApplicationCommandOptionType.Number,
              required: true,
              min_value: 0.0001,
            },
          ],
        }
      ],
    },
    {
      name: "shares",
      description: "Admin related commands for shares.",
      type: ApplicationCommandOptionType.SubcommandGroup,
      cooldown: 3000,
      options: [
        {
          name: "add",
          description: "Add shares to a user.",
          type: ApplicationCommandOptionType.Subcommand,
          cooldown: 3000,
          options: [
            {
              name: "user",
              description: "The user you want to add shares to.",
              type: ApplicationCommandOptionType.User,
              required: true,
            },
            {
              name: "ticker",
              description: "The ticker of the stock you want to add shares to.",
              type: ApplicationCommandOptionType.String,
              required: true,
              max_length: 10,
            },
            {
              name: "amount",
              description: "The amount of shares you want to add.",
              type: ApplicationCommandOptionType.Integer,
              required: true,
              min_value: 1,
            },
            {
              name: "note",
              description: "The note you want to add to the transaction.",
              type: ApplicationCommandOptionType.String,
              required: false,
              max_length: 250,
            }
          ],
        },
        {
          name: "remove",
          description: "Remove shares from a user.",
          type: ApplicationCommandOptionType.Subcommand,
          cooldown: 3000,
          options: [
            {
              name: "user",
              description: "The user you want to remove shares from.",
              type: ApplicationCommandOptionType.User,
              required: true,
            },
            {
              name: "ticker",
              description: "The ticker of the stock you want to remove shares from.",
              type: ApplicationCommandOptionType.String,
              required: true,
              max_length: 10,
            },
            {
              name: "amount",
              description: "The amount of shares you want to remove.",
              type: ApplicationCommandOptionType.Integer,
              required: true,
              min_value: 1,
            },
            {
              name: "note",
              description: "The note you want to add to the transaction.",
              type: ApplicationCommandOptionType.String,
              required: false,
              max_length: 250,
            }
          ],
        },
      ],
    },
    {
      name: "balance",
      description: "Admin related commands for a user's balance.",
      type: ApplicationCommandOptionType.SubcommandGroup,
      cooldown: 3000,
      options: [
        {
          name: "add",
          description: "Add balance to a user.",
          type: ApplicationCommandOptionType.Subcommand,
          cooldown: 3000,
          options: [
            {
              name: "user",
              description: "The user you want to add balance to.",
              type: ApplicationCommandOptionType.User,
              required: true,
            },
            {
              name: "amount",
              description: "The amount of balance you want to add.",
              type: ApplicationCommandOptionType.Number,
              required: true,
              min_value: 0.01,
            },
            {
              name: "note",
              description: "The note you want to add to the transaction.",
              type: ApplicationCommandOptionType.String,
              required: false,
              max_length: 250,
            }
          ],
        },
        {
          name: "remove",
          description: "Remove balance from a user.",
          type: ApplicationCommandOptionType.Subcommand,
          cooldown: 3000,
          options: [
            {
              name: "user",
              description: "The user you want to remove balance from.",
              type: ApplicationCommandOptionType.User,
              required: true,
            },
            {
              name: "amount",
              description: "The amount of balance you want to remove.",
              type: ApplicationCommandOptionType.Number,
              required: true,
              min_value: 0.01,
            },
            {
              name: "note",
              description: "The note you want to add to the transaction.",
              type: ApplicationCommandOptionType.String,
              required: false,
              max_length: 250,
            }
          ],
        },
        {
          name: "deposit",
          description: "Deposit balance to a user.",
          type: ApplicationCommandOptionType.Subcommand,
          cooldown: 3000,
          options: [
            {
              name: "user",
              description: "The user you want to deposit balance to.",
              type: ApplicationCommandOptionType.User,
              required: true,
            },
            {
              name: "amount",
              description: "The amount of balance you want to deposit.",
              type: ApplicationCommandOptionType.Number,
              required: true,
              min_value: 0.01,
            }
          ],
        },
        {
          name: "withdraw",
          description: "Withdraw balance from a user.",
          type: ApplicationCommandOptionType.Subcommand,
          cooldown: 3000,
          options: [
            {
              name: "user",
              description: "The user you want to withdraw balance from.",
              type: ApplicationCommandOptionType.User,
              required: true,
            },
            {
              name: "amount",
              description: "The amount of balance you want to withdraw.",
              type: ApplicationCommandOptionType.Number,
              required: true,
              min_value: 0.01,
            }
          ],
        },
      ],
    },
    {
      name: "roles",
      description: "Admin related commands for roles.",
      type: ApplicationCommandOptionType.SubcommandGroup,
      cooldown: 3000,
      options: [
        {
          name: "set",
          description: "Set a user's role/permissions.",
          type: ApplicationCommandOptionType.Subcommand,
          cooldown: 3000,
          options: [
            {
              name: "user",
              description: "The user you want to set the role/permissions of.",
              type: ApplicationCommandOptionType.User,
              required: true,
            },
            {
              name: "role",
              description: "The role you want to set.",
              type: ApplicationCommandOptionType.String,
              required: true,
              autocomplete: true,
            }
          ],
        },
      ],
    },
  ],
};
