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
const { combine, timestamp, printf, align, errors } = winston.format;

const events = require('events');
const fs = require('fs');
require('dotenv').config();

const Utils = require('./structs/Utils.js');
const Stocks = require('./structs/Stocks.js');
const Account = require('./structs/Account.js');

client.aliases = new Collection();
client.slashCommands = new Collection();
client.subCommands = new Collection();
client.buttons = new Collection();

client.emitter = new events.EventEmitter();
client.emitter.setMaxListeners(25);

client.utils = new Utils();
client.stocks = new Stocks();
client.account = new Account();

client.logger = winston.createLogger({
	level: 'info',
	format: combine(
		errors({ stack: true }),
		timestamp({ format: 'YYYY-MM-DD hh:mm:ss.SSS A' }),
		align(),
		printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
	),
	transports: [
		new winston.transports.Console(),
		new winston.transports.File({ filename: 'combined.log' }),
		new winston.transports.File({ filename: 'errors.log', level: 'error' })
	],
});

module.exports = client;

fs.readdirSync('./handlers').forEach((handler) => {
	require(`./handlers/${handler}`)(client);
});

client.login(process.env.TOKEN);