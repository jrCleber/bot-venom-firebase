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
// importando funções para manipulação de aruivos no sistema
import { writeFile, mkdir } from 'fs/promises'
import { existsSync, readFileSync, rm } from 'fs'

// tipos da mensagens que receberão tratamentos diferentes
const arrayTypes = ['image', 'location', 'broadcast', 'ptt', 'video', 'sticker', 'document', 'vcard', 'audio']

// tipando variável que receberá os comandos
let command: keyof typeof manageChat

// instanciando controller que gerenciará a collection de estágios do cliente
const chatControll = new AppController(collection.collChatControll)

// debug
const log = (value: any) => console.log(value)

// checagem de caminhos
const check = (path: string) => existsSync(path)
// definindo pasta padrão para checagen de tokens
const path = './tokens'
// definindo arquivo padrão para checagem de token
const sessionPath = `${path}/${botConfig.baseName}.json`

// salvar arquivo token
async function saveToken(client: Whatsapp) {
    /* 
        verificandp se a pasta tokens existe;
        se não existir ela será criada
    */
    if (!check(path)) await mkdir(path)
    // recuperando o token da sessão do navegador
    const browserSessionToken = await client.getSessionTokenBrowser()
    /*
        verificando se a sessão existe;
        se não existir a variável browserSessionToken será escrita na pasta
    */
    if (!check(sessionPath)) writeFile(sessionPath, JSON.stringify(browserSessionToken))
}

// ler arquivo token
function readToken() {
    try {
        return JSON.parse(readFileSync(sessionPath, 'utf-8'))
    } catch (error) {
        console.log({
            status: 404,
            message: 'o arquivo token não existe.\nCriando arquivo token'
        })
    }
}

/* MULTDEVICE FALSE */
export function bot() {
    // lendo arquivo token
    const token = readToken()
    console.log('Token: ', token)
    // criando sessão
    create(
        // nome da sessão
        botConfig.baseName,
        // catchQr - passarei esse parâmetro como indefinido - não enviarei o qr code para lugar algum
        (base64Qr, asciiQR, attempts, urlCode) => {
            /*
                se o valor da variável base64Qr for verdadeiro, significa que o usuário se
                desconectou no smartphone, nesse caso podemos excluir a pasta token, se ela existrir,
                e salvar novas configurações de browsertoken
            */
            if (base64Qr){
                log('Aparelho desconectado')
                // checando se a pasta tokens existe
                if (check(path)){
                    log('Removendo a pasta tokens')
                    rm(path, { recursive: true }, (err) => {
                        // esse erro nunca será mostrado, pois a fonção de remoção só será executada se o arquivo existir
                        if(err) console.log('A pasta não existe: ', err)
                        else log('Pasta tokens removida\n')
                    })
                }
            }
        },
        // status da sessão
        (statusSession, sessionName) => {
            console.log('Status Session: ', statusSession)
            console.log('Session Name: ', sessionName)
        },
        // opçoes de criação
        {
            multidevice: false
        },
        // parametros de criação da sessão - esse parâmetro pode ser nulo
        token
    )
        .then(client => run(client))
        .catch(err => console.log('Erro ao criar a sessão'))

    async function run(client: Whatsapp) {
        // realizandp a configuração da pasta tokens, caso ela não exista
        if (!check(sessionPath)) saveToken(client)
        // checando o status da conexão
        // client.onStateChange(state => console.log('STATE SESSION: ', state))
        client.onStateChange(state => {
            console.log('STATE SESSION: ', state)
        })

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