const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");

class PagedEmbed {
  constructor(interaction, embed, pages) {
    this.interaction = interaction;
    this.embed = embed;
    this.pages = pages;
    this.currentPage = 0;
  }

  async send(time = 60000, ephemeral = false) {
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId("previous")
          .setLabel("Previous")
          .setEmoji("⬅️")
          .setStyle("Secondary")
          .setDisabled(this.currentPage === 0),
        new ButtonBuilder()
          .setCustomId("next")
          .setLabel("Next")
          .setEmoji("➡️")
          .setStyle("Secondary")
          .setDisabled(this.currentPage === this.pages.length - 1)
      );

    const message = await this.interaction.reply({
      embeds: [this.embed],
      components: [row],
      ephemeral: ephemeral
    });

    const collector = message.createMessageComponentCollector({
      filter: (i) => i.user.id === this.interaction.user.id,
      time: time
    });

    collector.on("collect", async (i) => {
      if (i.customId === "previous") {
        if (this.currentPage === 0) return;
        this.currentPage--;
      } else if (i.customId === "next") {
        if (this.currentPage === this.pages.length - 1) return;
        this.currentPage++;
      }

      row.components[0].setDisabled(this.currentPage === 0);
      row.components[1].setDisabled(this.currentPage === this.pages.length - 1);

      this.embed = this.pages[this.currentPage];
      await i.update({
        embeds: [this.embed],
        components: [row]
      });
    });

    collector.on("end", async () => {
      await message.edit({
        components: []
      });
    });
  }
}

module.exports = PagedEmbed;