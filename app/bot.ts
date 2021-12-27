// importando arquivo de criação do bot
import { create, Whatsapp } from 'venom-bot'
// importando o controller da aplicação
import { AppController } from "./controller/appController"
// importando as configurações do bot
import botConfig from './settings/settingsBot.json'
//importando nome das collections
import collection from './data/collectionsNames.json'
// importando opções de respostas/comando
import myCommands from './messages/commands'
// importando o gerenciamento de chat
import manageChat from './messages/managementChat'

// tipos da mensagens que receberão tratamentos diferentes
const arrayTypes = ['image', 'location', 'broadcast', 'ptt', 'video', 'sticker', 'document', 'vcard', 'audio']

// tipando variável que receberá os comandos
let command: keyof typeof manageChat

// instanciando controller que gerenciará a collection de estágios do cliente
const chatControll = new AppController(collection.collChatControll)

// debug
const log = (value: any) => console.log(value)

export function bot() {
    create({
        session: botConfig.baseName,
        multidevice: true
    })
        .then(client => run(client))
        .catch(err => console.log('Erro ao criar a sessão'))

    function run(client: Whatsapp) {
        // checando o status da conexão
        client.onStateChange(state => console.log('STATE SESSION: ', state))

        client.onMessage(async message => {
            log(message)
            // verificando se o tipo da mensagem não está incluso nop arraytypes
            if (arrayTypes.includes(message.type) === false && message.isGroupMsg === false && message.hasOwnProperty('body')) {
                // recuperando estágios do cliente
                // se o retorno for nulo, é um cliente novo
                const chatState = await chatControll.getDocumetId(message.chatId)
                if (chatState === null || chatState === undefined) {
                    command = 'initChat'
                } else {
                    // se sim: passar as configurações de estágio do checkState
                    command = chatState?.codeState
                }
                // setando o comando para gerenciar o chat
                for (const [key, value] of Object.entries(myCommands)) {
                    if (value(message) === true) {
                        command = key as keyof typeof manageChat
                        break
                    }
                }

                // instanciando a função
                const chatManagement = manageChat[command]
                // verificando se a referência da função é verdadeira
                if (chatManagement !== undefined) {
                    chatManagement(message, client)
                }
            }
        })
    }
}