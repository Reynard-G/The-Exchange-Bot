const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "setimage",
  run: async (client, interaction) => {
    const ticker = interaction.options.getString("ticker").toUpperCase();
    const image = interaction.options.getAttachment("image");

    // Convert the url to a buffer
    const res = await fetch(image.url);
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await client.stocks.setImage(ticker, buffer);

    const embed = new EmbedBuilder()
      .setTitle("Success")
      .setDescription(`Successfully set the image for ${ticker}.`)
      .setColor("Green")
      .setImage(image.url)
      .setTimestamp()
      .setFooter({ text: "The Exchange  •  Invest in the future", iconURL: interaction.guild.iconURL() });

    return interaction.reply({ embeds: [embed] });
  }
};