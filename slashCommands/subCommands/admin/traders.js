const { EmbedBuilder } = require("discord.js");
const PagedEmbed = require("../../../structs/PagedEmbed.js");

module.exports = {
  name: "traders",
  run: async (client, interaction) => {

    const accounts = await client.account.accounts();
    const traders = await Promise.all(accounts.map(async (account) => {
      return {
        discord_id: account.discord_id,
        ign: account.ign,
        balance: await client.account.balance(account.discord_id),
        created_at: account.created_at_unix
      };
    }));

    const totalBalance = traders.reduce((acc, trader) => acc + Number(trader.balance), 0);

    const pages = [];
    for (let i = 0; i < traders.length; i += 5) {
      const page = new EmbedBuilder()
        .setTitle(`A list of all **${traders.length}** traders`)
        .setColor("#BB8FCE")
        .setTimestamp()
        .setFooter({ text: "The Exchange  •  Invest in the future", iconURL: interaction.guild.iconURL() });

      for (let j = i; j < i + 5; j++) {
        if (!traders[j]) break;

        const trader = traders[j];
        const { discord_id, ign, balance, created_at } = trader;

        page.addFields({
          name: `**${ign}**`,
          value: `**Discord:** <@${discord_id}>\n**Balance:** ${client.utils.formatCurrency(balance)}\n**Created At:** <t:${created_at}:f>`
        });
      }

      page.addFields({
        name: "**Total Balance**",
        value: `**${client.utils.formatCurrency(totalBalance)}**`
      });

      pages.push(page);
    }

    const pagedEmbed = new PagedEmbed(interaction, pages[0], pages);
    pagedEmbed.send(600000, true);
  }
};