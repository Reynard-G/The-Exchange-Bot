const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "set",
  autocomplete: async (client, interaction) => {
    const focusedValue = interaction.options.getFocused();
    const roles = await client.account.roles()
      .then(roles => roles.map(role => ({ name: role.name, value: (role.id).toString() })));
    const filteredRoles = roles.filter(role => role.name.toLowerCase().includes(focusedValue.toLowerCase()));

    await interaction.respond(filteredRoles);
  },
  run: async (client, interaction) => {
    const user = interaction.options.getUser("user");
    const roleID = interaction.options.getString("role");
    const roleDiscordID = await client.account.roles()
      .then(roles => roles.find(role => role.id == roleID).discord_id);

    const embed = new EmbedBuilder()
      .setTitle("Role Added")
      .setFields(
        { name: "User", value: `<@${user.id}>` },
        { name: "Role", value: `<@&${roleDiscordID}>` }
      )
      .setColor("#BB8FCE")
      .setTimestamp()
      .setFooter({ text: "The Exchange  •  Invest in the future", iconURL: interaction.guild.iconURL() });

    await client.account.setRole(user.id, roleID);

    const role = await interaction.guild.roles.fetch()
      .then(roles => roles.find(role => role.id == roleDiscordID));
    await interaction.guild.members.cache.get(user.id).roles.add(role);

    return interaction.reply({
      embeds: [embed]
    });
  }
};