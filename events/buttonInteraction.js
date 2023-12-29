const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const client = require("..");

client.on("interactionCreate", async interaction => {
  if (!interaction.isButton()) return;

  const button = client.buttons.get(interaction.customId);
  if (!button) return;

  client.logger.info(`${interaction.user.tag} (${interaction.user.id}) ${interaction.customId}`);

  try {
    if (button.permissions) {
      if (!interaction.memberPermissions.has(PermissionsBitField.resolve(button.permissions || []))) {
        const perms = new EmbedBuilder()
          .setDescription(`🚫 ${interaction.user}, You don't have \`${button.permissions}\` permissions to interact this button!`)
          .setColor("Red");
        return interaction.reply({ embeds: [perms], ephemeral: true });
      }
    }
    await button.run(client, interaction);
  } catch (error) {
    if (error.name === "NoDataError") {
      client.logger.warn(`${interaction.user.tag} (${interaction.user.id}) tried to access data that doesn't exist.`);
      await interaction.followUp({
        embeds: [
          new EmbedBuilder()
            .setTitle("No Data")
            .setDescription(`The data you've requested does not exist. Please look at the error message below for more information.`)
            .addFields(
              {
                name: "Error",
                value: error.message
              }
            )
            .setColor("Red")
            .setTimestamp()
            .setFooter({ text: "The Exchange  •  Invest in the future", iconURL: client.user.avatarURL() })
        ],
        ephemeral: true
      });
    } else {
      client.logger.error(error.stack);
    }
  }
});
