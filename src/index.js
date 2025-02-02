require('dotenv').config();
const fs = require('fs');
const { Client, GatewayIntentBits, Partials, Collection, PermissionsBitField } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
client.buttons = new Collection();

module.exports = client;

// Event handler integration
require('./handlers/events')(client);

// Command registration logic
const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN);

const commands = [];
fs.readdirSync('./src/commands').forEach(async dir => {
    const cmdFiles = fs.readdirSync(`./src/commands/${dir}`).filter(file => file.endsWith('.js'));

    for (const file of cmdFiles) {
        const cmd = require(`../commands/${dir}/${file}`);
        commands.push({
            name: cmd.name,
            description: cmd.description,
            type: cmd.type,
            options: cmd.options ? cmd.options : null,
            default_permission: cmd.default_permission ? cmd.default_permission : null,
            default_member_permissions: cmd.default_member_permissions ? PermissionsBitField.resolve(cmd.default_member_permissions).toString() : null
        });

        if (cmd.name) {
            client.commands.set(cmd.name, cmd);
        } else {
            console.log(`Client - Failed to load ${file.split('.js')[0]}`);
        }
    }
});

(async () => {
    try {
        await rest.put(
            Routes.applicationCommands(process.env.BOT_ID), // Registering globally
            { body: commands }
        );
        console.log(`Client - Application (/) commands registered globally`);
    } catch (e) {
        console.log(`Client - Failed to register application (/) commands globally`, e);
    }
})();


client.login(process.env.BOT_TOKEN);
