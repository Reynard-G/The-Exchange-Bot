const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "add",
  run: async (client, interaction) => {
    const user = interaction.options.getUser("user");
    const amount = interaction.options.getNumber("amount");
    const note = interaction.options.getString("note");

    const embed = new EmbedBuilder()
      .setTimestamp()
      .setFooter({ text: `The Exchange  •  Invest in the future`, iconURL: interaction.guild.iconURL() });
      
    const isRegistered = await client.account.isRegistered(user.id);
    if (!isRegistered) {
      embed.setTitle("Error")
        .setDescription("That user is not registered.")
        .setColor("Red");
    } else {
      const isFrozen = await client.account.isFrozen(user.id);
      if (isFrozen) {
        embed.setTitle("Error")
          .setDescription(`The user <@${user.id}> is currently frozen. Use \`/admin user unfreeze\` to unfreeze them.`)
          .setColor("Red");
      } else {
        await client.account.addBalance(user.id, amount, note);
        embed.setTitle("Success")
          .setDescription(`Successfully added **${client.utils.formatCurrency(amount)}** to <@${user.id}>'s account.`) 
          .setColor("Green");
      }
    }

    return interaction.reply({
      embeds: [embed]
    });
  }
}