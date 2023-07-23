const { EmbedBuilder, ApplicationCommandType } = require("discord.js");
const Stocks = require("../../structs/Stocks.js");

module.exports = {
  name: "companies",
  description: "View all publicly traded companies.",
  cooldown: 3000,
  type: ApplicationCommandType.ChatInput,
  run: async (client, interaction) => {
    const stock = new Stocks();
    const companies = await stock.companies();

    const embed = new EmbedBuilder()
      .setTitle("Companies")
      .setDescription(`There are **${companies.length}** publicly traded companies.`)
      .setFields(
        companies.map(company => {
          return {
            name: company.ticker,
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
