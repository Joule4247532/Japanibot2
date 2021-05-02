require('module-alias/register')
require('dotenv').config()

const Discord = require('discord.js')
const client = new Discord.Client()
const manager = require('@modules/module-manager')

client.on('ready', () => {
    console.log('Client ready')
    manager(client)
})

client.login(process.env.token)