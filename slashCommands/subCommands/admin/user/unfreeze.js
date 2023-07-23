const { EmbedBuilder } = require("discord.js");
const Account = require("../../../../structs/Account.js");

module.exports = {
  name: "unfreeze",
  run: async (client, interaction) => {
    const account = new Account();
    const user = interaction.options.getUser("user");

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
      if (!isFrozen) {
        embed.setTitle("Error")
          .setDescription(`The user <@${user.id}> is not frozen. Use \`/admin user freeze\` to freeze them.`)
          .setColor("Red");
      } else {
        await account.unfreeze(user.id);
        embed.setTitle("Success")
          .setDescription(`Successfully unfroze <@${user.id}>.`)
          .setColor("Green");
      }
    }

    return interaction.reply({
      embeds: [embed]
    });
  }
};