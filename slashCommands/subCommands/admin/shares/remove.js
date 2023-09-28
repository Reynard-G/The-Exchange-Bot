const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "remove",
  run: async (client, interaction) => {
    const user = interaction.options.getUser("user");
    const ticker = interaction.options.getString("ticker").toUpperCase();
    const amount = interaction.options.getInteger("amount");
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

    await client.account.removeShares(user.id, ticker, amount, 0, note);
    embed.setTitle("Success")
      .setDescription(`Successfully removed **${amount}** shares of **${ticker}** from <@${user.id}>.`)
      .setColor("Green");

    return interaction.reply({
      embeds: [embed]
    });
  }
};