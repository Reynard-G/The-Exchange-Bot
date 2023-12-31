const { EmbedBuilder, ApplicationCommandType } = require("discord.js");

module.exports = {
  name: "remove",
  type: ApplicationCommandType.ChatInput,
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
    }
    
    await client.account.removeBalance(user.id, amount, 0, note);
    embed.setTitle("Success")
      .setDescription(`Successfully removed **${client.utils.formatCurrency(amount)}** from <@${user.id}>'s account.`)
      .setColor("Green");

    return interaction.reply({
      embeds: [embed]
    });
  }
};