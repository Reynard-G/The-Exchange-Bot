const { EmbedBuilder, ApplicationCommandOptionType, ApplicationCommandType } = require("discord.js");
const Account = require("../../structs/Account.js");

module.exports = {
  name: "register",
  description: "Register an account.",
  cooldown: 3000,
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "user",
      description: "The user you want to register.",
      type: ApplicationCommandOptionType.User,
      required: true
    },
    {
      name: "username",
      description: "The username you want to register.",
      type: ApplicationCommandOptionType.String,
      required: true,
      min_length: 3,
      max_length: 16
    }
  ],
  run: async (client, interaction) => {
    const account = new Account();
    const discord_id = interaction.options.getUser("user").id;
    const username = interaction.options.getString("username");

    await account.register(discord_id, username);

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Account Registered")
          .setDescription(`Their account has been registered with the username \`${username}\` and the Discord ID \`${discord_id}\`.`)
          .setColor("Green")
          .setTimestamp()
          .setFooter({ text: "The Exchange  •  Invest in the future", iconURL: interaction.guild.iconURL() })
      ]
    });
  }
};
