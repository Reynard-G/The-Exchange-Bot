const { EmbedBuilder, ApplicationCommandType } = require("discord.js");

module.exports = {
  name: "companies",
  description: "View all publicly traded companies.",
  cooldown: 3000,
  dm_permission: false,
  type: ApplicationCommandType.ChatInput,
  run: async (client, interaction) => {
    // Filter companies that have `delisted` set to 1
    const companies = (await client.stocks.companies()).filter(company => company.delisted === 0);

    const embed = new EmbedBuilder()
      .setTitle("Companies")
      .setDescription(`There are **${companies.length}** publicly traded companies.`)
      .setFields(
        companies.map(company => {
          return {
            name: company.frozen === 1 ? `🧊 ${company.ticker}` : company.ticker,
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
