const { EmbedBuilder } = require("discord.js");
const Stocks = require("../../../../structs/Stocks.js");

module.exports = {
  name: "adjust",
  run: async (client, interaction) => {
    const ticker = interaction.options.getString("ticker").toUpperCase();
    const newPPS = interaction.options.getNumber("new_price_per_share");


  }
};