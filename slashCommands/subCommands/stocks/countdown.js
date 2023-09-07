const { EmbedBuilder } = require("discord.js");
const { DateTime } = require("luxon");

module.exports = {
  name: "countdown",
  run: async (client, interaction) => {
    const midnight = DateTime.now().setZone("America/New_York").startOf("day").plus({ days: 1 }).toSeconds();

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Next Market Day Countdown")
          .setFields(
            { name: "Time", value: `<t:${midnight}:T>`, inline: true },
            { name: "Countdown", value: `<t:${midnight}:R>`, inline: true }
          )
          .setColor("#BB8FCE")
          .setTimestamp()
          .setFooter({ text: "The Exchange  •  Invest in the future", iconURL: interaction.guild.iconURL() })
      ],
      ephemeral: true
    });
  }
};