const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.MessageContent
	],
	partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember, Partials.Reaction]
});
const winston = require('winston');
const { combine, timestamp, printf, align } = winston.format;

const events = require('events');
const fs = require('fs');
require('dotenv').config();

client.aliases = new Collection();
client.slashCommands = new Collection();
client.subCommands = new Collection();
client.buttons = new Collection();

client.emitter = new events.EventEmitter();
client.emitter.setMaxListeners(15);

client.logger = winston.createLogger({
	level: 'info',
	format: combine(
		timestamp({ format: 'YYYY-MM-DD hh:mm:ss.SSS A' }),
		align(),
		printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
	),
	transports: [
		new winston.transports.Console(),
		new winston.transports.File({ filename: 'combined.log' }),
	],
});

module.exports = client;

fs.readdirSync('./handlers').forEach((handler) => {
	require(`./handlers/${handler}`)(client);
});

client.login(process.env.TOKEN);