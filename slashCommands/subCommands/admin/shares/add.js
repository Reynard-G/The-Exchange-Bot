const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "add",
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

    await client.account.addShares(user.id, ticker, amount, 0, note);
    embed.setTitle("Success")
      .setDescription(`Successfully added **${amount}** shares of **${ticker}** to <@${user.id}>.`)
      .setColor("Green");

    return interaction.reply({
      embeds: [embed]
    });
  }
};