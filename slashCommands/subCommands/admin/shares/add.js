const { EmbedBuilder } = require("discord.js");
const Account = require("../../../../structs/Account.js");

module.exports = {
  name: "add",
  run: async (client, interaction) => {
    const account = new Account();
    const user = interaction.options.getUser("user");
    const ticker = interaction.options.getString("ticker").toUpperCase();
    const amount = interaction.options.getInteger("amount");
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
        await account.addShares(user.id, ticker, amount, note);
        embed.setTitle("Success")
          .setDescription(`Successfully added **${amount}** shares of **${ticker}** to <@${user.id}>.`)
          .setColor("Green");
      }
    }

    return interaction.reply({
      embeds: [embed]
    });
  }
};