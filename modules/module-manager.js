const path = require('path')
const fs = require('fs')

const { prefix, owner } = require('@data/base')
const { range } = require('mathjs')

const validatePermissions = (permissions) => {
    const permissionList = [
        'CREATE_INSTANT_INVITE',
        'KICK_MEMBERS',
        'BAN_MEMBERS',
        'ADMINISTRATOR',
        'MANAGE_CHANNELS',
        'MANAGE_GUILD',
        'ADD_REACTIONS',
        'VIEW_AUDIT_LOG',
        'PRIORITY_SPEAKER',
        'STREAM',
        'VIEW_CHANNEL',
        'SEND_MESSAGES',
        'SEND_TTS_MESSAGES',
        'MANAGE_MESSAGES',
        'EMBED_LINKS',
        'ATTACH_FILES',
        'READ_MESSAGE_HISTORY',
        'MENTION_EVERYONE',
        'USE_EXTERNAL_EMOJIS',
        'VIEW_GUILD_INSIGHTS',
        'CONNECT',
        'SPEAK',
        'MUTE_MEMBERS',
        'DEAFEN_MEMBERS',
        'MOVE_MEMBERS',
        'USE_VAD',
        'CHANGE_NICKNAME',
        'MANAGE_NICKNAMES',
        'MANAGE_ROLES',
        'MANAGE_WEBHOOKS',
        'MANAGE_EMOJIS',
    ]

    for (const permission of permissions) {
        if (!permissionList.includes(permission)) {
            throw new Error(`Unknown permission node "${permission}"`)
        }
    }
}

module.exports = (client) => {
    const parsed = JSON.parse(fs.readFileSync(path.join(__dirname, "/parsed.json")).toString())
    parsed.dynamic_help = []
    parsed.commands = {}
    parsed.reactors = {}
    parsed.schedulers = {}
    const readFiles = (dir, type, moduleName) => {
        const files = fs.readdirSync(dir)
        for (const file of files) {
            const stat = fs.lstatSync(path.join(dir, file))
            if (stat.isDirectory()) {
                readFiles(path.join(dir, file), type)
            }
            const eventPath = path.join(dir, file)
            console.log(`registering: ${type}: ${file}`)
            if (type === "command") {
                const cmd = require(eventPath)
                parsed.dynamic_help.push({
                    moduleName: moduleName,
                    aliases: cmd.aliases,
                    description: cmd.description,
                    syntax: cmd.syntax,
                    reqPerms: cmd.reqPerms,
                    reqRoles: cmd.reqRoles,
                    ownerOnly: cmd.ownerOnly
                })
                for (const alias of cmd.aliases) {
                    parsed.commands[prefix + alias] = eventPath
                }
            } else if (type === "reactor") {
                const { message_ids } = require(eventPath)
                for (const id of message_ids) {
                    parsed.reactors[id] = eventPath
                }
            } else if (type === "scheduler") {
                const { name } = require(eventPath)
                parsed.schedulers[name] = eventPath
            }
        }
    }
    const modules = fs.readdirSync(__dirname)
    for (const moduleName of modules) {
        const stat = fs.lstatSync(path.join(__dirname, moduleName))
        if (!stat.isDirectory()) {
            continue
        }
        console.log(`Module: ${moduleName}`)
        const moduleCommandFiles = path.join(__dirname, moduleName, "/commands")
        const moduleReactorFiles = path.join(__dirname, moduleName, "/reactors")
        const moduleSchedulerFiles = path.join(__dirname, moduleName, "/schedulers")
        try {
            if (fs.readdirSync(moduleCommandFiles).length !== 0) {
                readFiles(moduleCommandFiles, "command", moduleName)
            }
            if (fs.readdirSync(moduleReactorFiles).length !== 0) {
                readFiles(moduleReactorFiles, "reactor")
            }
            if (fs.readdirSync(moduleSchedulerFiles).length !== 0) {
                readFiles(moduleSchedulerFiles, "scheduler")
            }
        } catch(err) {
            console.log(err)
        }
    }
    fs.writeFileSync(path.join(__dirname, "/parsed.json"), JSON.stringify(parsed, null, 4))

    client.on("message", (message) => {
        
        const { member, content } = message
        if (content.toLowerCase().startsWith(prefix)) {
            
            const { commands } = require(path.join(__dirname, "/parsed.json"))
            const cmdArgs = content.split(/[ ]+/)
            const cmdPath = commands[cmdArgs[0]]
            if (!cmdPath) {
                return
            }
            
            let {
                syntax = "",
                reqArgs = 0,
                optArgs = 0,
                textArg = false,
                reqPerms = [],
                reqRoles = [],
                ownerOnly = false,
                callback
            } = require(cmdPath)
            if (reqPerms.length) {
                if (typeof reqPerms === 'string') {
                    reqPerms = [reqPerms]
                }
                validatePermissions(reqPerms)
                for (const permission of reqPerms) {
                    if (!member.hasPermission(permission)) {
                        message.reply("Tu n'as pas le droit de faire cette commande")
                        return
                    }
                }
            }
        
            if (reqRoles.length) {
                if (typeof reqRoles === 'string') {
                    reqRoles = [reqRoles]
                }
                for (const requiredRole of reqRoles) {
                    const role = guild.roles.cache.find(fetchedRole => fetchedRole.name === requiredRole)
                    if (!role || !member.roles.cache.has(role.id)) {
                        message.reply(`Tu n'as pas le role necessaire (${requiredRole})`+
                            `pour faire cette commande, ou le role necessaire n'existe pas`)
                        return
                    }
                }
            }
            if (ownerOnly && owner !== member.user.id){
                message.reply("Cette commande ne peut etre utilise par le createur du bot")
                return
            }
            const alias = cmdArgs[0]
            cmdArgs.shift()
            if (cmdArgs.length < reqArgs || 
                (!textArg && cmdArgs.length > reqArgs+optArgs)) {
                    message.reply(`Syntaxe incorrecte! Utilise: ${alias} ${syntax}`)
                    return
            }
            let args = []
            for (const arg in cmdArgs) {
                if (arg <= reqArgs+optArgs) {
                    args.push(cmdArgs.splice(arg, 1))
                } else {
                    args.push(cmdArgs.join(" "))
                    break
                }
            }
            callback({
                client,
                message,
                member,
                content,
                args
            })
        }
    })

    client.on('messageReactionAdd', (reaction, user) => {
        console.log(`Reaction add not implemented: \nReaction: ${reaction}\nUser: ${user}`)
    })

    client.on('messageReactionRemove', (reaction, user) => {
        console.log(`Reaction remove not implemented: \nReaction: ${reaction}\nUser: ${user}`)
    })

    // Scheduler callback
}