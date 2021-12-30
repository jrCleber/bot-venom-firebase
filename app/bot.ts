// importando arquivo de criação do bot
import { create, Whatsapp } from 'venom-bot'
// importando o controller da aplicação
import { AppController } from "./controller/appController"
// importando as configurações do bot
import botConfig from './jsonConfig/settingsBot.json'
//importando nome das collections
import collection from './data/collectionsNames.json'
// importando opções de respostas/comando
import { initCommands } from './chatManage/commands'
// importando o gerenciamento de chat
import { manageChat } from './chatManage/managementChat'

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
                // se o retornar um valor false é um cliente novo
                const chatState = await chatControll.getDocumetId(message.chatId)
                if (chatState?.exists) {
                    // se sim: passar as configurações de estágio do checkState
                    command = chatState?.data().codeState
                } else {
                    // se não: passar o comando de início de chat
                    command = 'initChat'
                }
                /* 
                    fazendo a varredura para verificar se o comando existe na lista de comandos
                    caso os estágios do cliente estejam zerados no banco.
                    isso acontece, pois no final do atendimento, os estágios do cliente serão reiniciados no banco,
                    ou quando o cliente estiver em algum subestágio do atendimento
                */
                for (const [key, func] of Object.entries(initCommands)) {
                    /*
                        verificando se o cliente enviou algum comando válido e atribuindo o comando na variável command
                        se não, mantém-se o valor da variável command do bloco if
                    */
                    if (func(message) === true) {
                        command = key as keyof typeof manageChat
                        break
                    }
                }

                // instanciando a função
                const chatManagement = manageChat[command]
                // verificando se a referência da função é verdadeira
                if (chatManagement !== undefined) {
                    chatManagement(message, client)
                } else {
                    // enviar para o cliente uma mensagem dizendo que não foi possível compreender a sua intenção
                }
            }
        })
    }
}