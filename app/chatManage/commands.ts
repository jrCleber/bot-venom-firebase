import { Message } from './interfaces/interfaceMessage'
import options from '../jsonConfig/optionsBot.json'
// relação de comandos para gerenciamento do chat
const initCommands = {
    initOrder(message: Message) {
        const body = message.body.toLowerCase()
        return options.order.openOrder.includes(body)
    },
    sendMenuImage(message: Message) {
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
    },
    okOrder(message: Message) {
        const body = message.body.toLowerCase()
        return options.order.okOrder.includes(body)
    },
    cancelOrder(message: Message){
        const body = message.body.toLowerCase()      
        return options.cancel.includes(body)
    }
}
// relação de comandos para gerenciamento de ordem
const orderCommands = {
    addOrder(message: Message) {
        const body = message.body.toLowerCase()
        return options.order.addOrder.includes(body)
    },
    notAdd(message: Message) {
        const body = message.body.toLowerCase()
        return options.notAdd.includes(body)
    }
}

// exportando como namespaces para facilitar a importação
export { initCommands, orderCommands }