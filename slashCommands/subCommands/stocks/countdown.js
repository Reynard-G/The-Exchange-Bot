const { EmbedBuilder } = require("discord.js");
const moment = require("moment");

module.exports = {
  name: "countdown",
  run: async (client, interaction) => {
    const midnight = moment().utcOffset(-4).startOf("day").add(1, "day").unix();

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
      ephemeral: tru
    });
  }
};