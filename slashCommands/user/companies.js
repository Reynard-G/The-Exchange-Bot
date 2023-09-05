const { EmbedBuilder, ApplicationCommandType } = require("discord.js");
const Stocks = require("../../structs/Stocks.js");

module.exports = {
  name: "companies",
  description: "View all publicly traded companies.",
  cooldown: 3000,
  type: ApplicationCommandType.ChatInput,
  run: async (client, interaction) => {
    const stock = new Stocks();

    // Filter companies that have `delisted` set to 1
    const companies = (await stock.companies()).filter(company => company.delisted === 0);

    const embed = new EmbedBuilder()
      .setTitle("Companies")
      .setDescription(`There are **${companies.length}** publicly traded companies.`)
      .setFields(
        companies.map(company => {
          return {
            name: company.frozen === 1 ? `🧊 ${company.company_name}` : company.company_name,
            value: company.company_name,
            inline: true
          };
        })
      )
      .setColor("#BB8FCE")
      .setTimestamp()
      .setFooter({ text: "The Exchange  •  Invest in the future", iconURL: interaction.guild.iconURL() });

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};
