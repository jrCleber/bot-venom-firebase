import { Message } from 'venom-bot'
import options from '../settings/optionsBot.json'
// relação de comandos para gerenciamento do chat
const myCommands = {
    initOrder(message: Message) {
        const body = message.body.toLowerCase()
        return options.order.openOrder.includes(body)
    },
    sendMenu(message: Message) {
        const body = message.body.toLowerCase()
        return options.seeMenu.includes(body)
    },
    cancelChat(message: Message) {
        const body = message.body.toLowerCase()
        return options.return.includes(body)
    },
    otherOptions(message: Message) {
        const body = message.body.toLowerCase()
        return options.otherOptions.includes(body)
    },
    callBot(message: Message) {
        const body = message.body.toLowerCase()
        return options.callBot.includes(body)
    }
}

export default myCommands