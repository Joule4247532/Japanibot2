const { MessageEmbed } = require("discord.js")
const { prefix, owner } = require('@data/base')

module.exports = {
    aliases: ["help", "h"],
    description: "Affiche ce message d'aide",
    syntax: "",
    reqArgs: 0,
    optArgs: 0,
    textArg: false,
    reqPerms: [],
    reqRoles: [],
    ownerOnly: false,
    callback: ({ message }) => {
        const { dynamic_help } = require('@modules/parsed.json')
        const avatar = message.guild.me.user.avatarURL()
        const embed = new MessageEmbed()
            .setTitle("Commandes de Japanibot")
            .setThumbnail(avatar)
            .setColor('#abf5ff')
        let catEmbed = new MessageEmbed()
            .setColor('#abf5ff')
        let cat = ""
        for (const command of dynamic_help) {
            let permissions = command.reqPerms

            if (permissions) {
                let hasPermission = true
                if (typeof permissions === 'string') {
                    permissions = [permissions]
                }

                for  (const permission of permissions) {
                    if (!message.member.hasPermission(permission)) {
                        hasPermission = false
                        break
                    }
                }

                

                if (!hasPermission) {
                    continue
                }
            }

            if (command.ownerOnly && owner !== member.user.id) {
                continue
            }
            
            
            if (cat !== command.moduleName) {
                if(cat === "") {
                    message.channel.send(embed)
                } else {
                    message.channel.send(catEmbed)
                    catEmbed = new MessageEmbed().setColor('#abf5ff')
                }
                cat = command.moduleName
                catEmbed.addField("Category:", cat.charAt(0).toUpperCase() + cat.slice(1), false)
            }
            catEmbed.addField(prefix+command.aliases[0], `Arguments: ${command.syntax}\nDescription: ${command.description}`, false)
        }
        message.channel.send(catEmbed)
    }
}