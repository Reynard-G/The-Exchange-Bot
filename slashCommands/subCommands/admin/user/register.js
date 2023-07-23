const { EmbedBuilder } = require("discord.js");
const Account = require("../../../../structs/Account.js");

module.exports = {
  name: "register",
  run: async (client, interaction) => {
    const account = new Account();
    const discord_id = interaction.options.getUser("user").id;
    const username = interaction.options.getString("username");

    await account.register(discord_id, username);

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Account Registered")
          .setDescription(`<@${discord_id}> has been registered with the username **${username}**.`)
          .setColor("Green")
          .setTimestamp()
          .setFooter({ text: "The Exchange  •  Invest in the future", iconURL: interaction.guild.iconURL() })
      ]
    });
  }
};