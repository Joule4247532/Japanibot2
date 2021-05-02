

module.exports = {
    aliases: ["ping"],
    syntax: "",
    description: "Calcule et montre la latence du bot et du API",
    callback: ({ message, client }) => {
        message.channel.send('Pong!').then(resultMessage => {
            const ping = resultMessage.createdTimestamp - message.createdTimestamp
            message.channel.send(`Bot latency: ${ping}, API Latency: ${client.ws.ping}`)
        })
    }
}