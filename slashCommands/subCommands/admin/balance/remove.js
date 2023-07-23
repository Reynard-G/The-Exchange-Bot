const { EmbedBuilder, ApplicationCommandType } = require("discord.js");
const Account = require("../../../../structs/Account.js");

module.exports = {
  name: "remove",
  type: ApplicationCommandType.ChatInput,
  run: async (client, interaction) => {
    const account = new Account();
    const user = interaction.options.getUser("user");
    const amount = interaction.options.getNumber("amount");
    const note = interaction.options.getString("note");

    const embed = new EmbedBuilder()
      .setTimestamp()
      .setFooter({ text: `The Exchange  •  Invest in the future`, iconURL: interaction.guild.iconURL() });

    const isRegistered = await account.isRegistered(user.id);
    if (!isRegistered) {
      embed.setTitle("Error")
        .setDescription("That user is not registered.")
        .setColor("Red");
    } else {
      const isFrozen = await account.isFrozen(user.id);
      if (isFrozen) {
        embed.setTitle("Error")
          .setDescription(`The user <@${user.id}> is currently frozen. Use \`/admin user unfreeze\` to unfreeze them.`)
          .setColor("Red");
      } else {
        await account.removeBalance(user.id, amount, note);
        embed.setTitle("Success")
          .setDescription(`Successfully removed **${account.formatCurrency(amount)}** from <@${user.id}>'s account.`)
          .setColor("Green");
      }
    }

    return interaction.reply({
      embeds: [embed]
    });
  }
};