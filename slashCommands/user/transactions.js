const { EmbedBuilder, ApplicationCommandType } = require("discord.js");
const PagedEmbed = require("../../structs/PagedEmbed.js");

module.exports = {
  name: "transactions",
  description: "View your transaction history.",
  cooldown: 3000,
  type: ApplicationCommandType.ChatInput,
  run: async (client, interaction) => {
    const transactions = await client.account.transactions(interaction.user.id);

    const embed = new EmbedBuilder()
      .setTitle("Transactions")
      .setColor("#BB8FCE")
      .setTimestamp()
      .setFooter({ text: "The Exchange  •  Invest in the future", iconURL: interaction.guild.iconURL() });

    if (!transactions) {
      embed.setDescription("You have no transactions.");
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const pages = [];
    const titleMap = {
      "DR_CR": "Buy",
      "CR_DR": "Sell",
      "CR_null": "Deposit",
      "DR_null": "Withdrawal",
      "null_CR": "Shares Added",
      "null_DR": "Shares Removed",
      "null_null": "Unknown",
    };

    // Place code here
    for (let i = 0; i < transactions.length; i += 5) {
      const page = new EmbedBuilder()
        .setTitle("Transactions")
        .setColor("#BB8FCE")
        .setTimestamp()
        .setFooter({ text: "The Exchange  •  Invest in the future", iconURL: interaction.guild.iconURL() });

      for (let j = i; j < i + 5; j++) {
        if (!transactions[j]) break;

        const transaction = transactions[j];
        const { amount, ticker, ticker_amount, amount_transaction_type, ticker_transaction_type, note, created_at_unix } = transaction;

        let fieldTitle = "";
        let fieldValue = "";

        const transactionType = `${amount_transaction_type}_${ticker_transaction_type}`;
        fieldTitle = ` ${titleMap[transactionType]}`;

        if (ticker && ticker_amount && amount != 0) {
          fieldValue = `**Ticker:** ${ticker}\n**Shares Amount:** ${ticker_amount}\n**Amount:** ${client.utils.formatCurrency(amount)}`;
        } else if (ticker && ticker_amount) {
          fieldValue = `**Ticker:** ${ticker}\n**Shares Amount:** ${ticker_amount}`;
        } else {
          fieldValue = `**Amount:** ${client.utils.formatCurrency(amount)}`;
        }

        if (note) fieldValue += `\n**Note:** ${note}`;

        fieldValue += `\n**Date:** <t:${created_at_unix}:F>`;

        page.addFields({ name: fieldTitle, value: fieldValue });
      }

      pages.push(page);
    }

    const pagedEmbed = new PagedEmbed(interaction, pages[0], pages);
    pagedEmbed.send(300000, true);
  }
};