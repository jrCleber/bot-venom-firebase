// importando enumerações
import { EnumField as Field } from './utils/enum'
// importando arquivo de criação do bot
import { create, Whatsapp } from 'venom-bot'
// importando tipagem da variável mensagem
import { Message } from './chatManage/interfaces/interfaceMessage'
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
import { existsSync, readFileSync, unlink } from 'fs'
import { TBrowserSessionToken } from './types/types'
// tipos da mensagens que receberão tratamentos diferentes
const arrayTypes = ['image', 'location', 'broadcast', 'ptt', 'video', 'sticker', 'document', 'vcard', 'audio']

// tipando variável que receberá os comandos
let command: keyof typeof manageChat

// instanciando controller que gerenciará a collection de estágios do cliente
const chatControll = new AppController(collection.collChatControll)

/**
 * debug
 * @param value 
 * @returns 
 */
const log = (value: any) => console.log(value)

/**
 * checagem de caminhos
 * @param path 
 * @returns 
 */
const check = (path: string) => existsSync(path)
// definindo pasta padrão para checagen de tokens
const path = './tokens'
// definindo arquivo padrão para checagem de token
const sessionPath = `${path}/${botConfig.baseName}.json`

/**
 * salvar arquivo token
 * @param client 
 */
async function saveToken(client: Whatsapp) {
    /**
     * verificandp se a pasta tokens existe;
     * se não existir ela será criada
     */
    if (!check(path)) await mkdir(path)
    // recuperando o token da sessão do navegador
    const browserSessionToken = await client.getSessionTokenBrowser()
    /**
     * verificando se a sessão existe;
     * se não existir a variável browserSessionToken será escrita na pasta
     */
    if (!check(sessionPath)) writeFile(sessionPath, JSON.stringify(browserSessionToken))
}
/**
 * ler arquivo token
 * @returns 
 */
function readToken(): TBrowserSessionToken | undefined {
    try {
        return JSON.parse(readFileSync(sessionPath, 'utf-8'))
    } catch (error) {
        console.log({
            status: 404,
            message: 'o arquivo token não existe.\nCriando arquivo token',
        })
    }
}

/**
 * função que faz o gerenciamento do bot
 * @param client 
 */
async function run(client: Whatsapp) {
    // realizandp a configuração da pasta tokens, caso ela não exista
    if (!check(sessionPath)) saveToken(client)
    // ouvindo todas as mensagens que são recebidas
    client.onMessage(async (message) => {
        log(message.quotedMsgObj)
        // verificando se o tipo da mensagem não está incluso nop arraytypes
        if (arrayTypes.includes(message.type) === false && message.isGroupMsg === false && message.hasOwnProperty('body')) {
            // referenciando o documento de estágios do cliente
            const documentReference = await chatControll.getDocumetId(message.chatId)
            // alocando dados do documento
            const documentData = documentReference?.data()
            // verificando se o documento está vazio
            if (documentReference?.exists) {
                // se sim: passar as configurações de estágio do checkState
                command = documentData[Field.codeState]
            } else {
                // se não: passar o comando de início de chat
                command = 'initChat'
            }
            /**
             * fazendo a varredura para verificar se o comando existe na lista de comandos
             * caso os estágios do cliente estejam zerados no banco.
             * isso acontece, pois no final do atendimento, os estágios do cliente serão reiniciados no banco,
             * ou quando o cliente estiver em algum subestágio do atendimento
             */
            for (const [key, func] of Object.entries(initCommands)) {
                /**
                 * verificando se o cliente enviou algum comando válido e atribuindo o comando na variável command
                 * se não, mantém-se o valor da variável command do bloco if
                 */
                if (func(message) === true) {
                    command = key as keyof typeof manageChat
                    break
                }
            }
            // instanciando a função
            const chatManagement = manageChat[command]
            // verificando se a referência da função é verdadeira
            if (chatManagement) {
                chatManagement(message, client)
            }
        }
    })
}
/**
 * CRIANDO O BOT COM O MULTDEVICE FALSE
 */
export async function bot() {
    // criando variável cliente
    let client: Whatsapp
    // lendo arquivo token
    const browserSessionToken: TBrowserSessionToken = readToken()
    // criando sessão
    try {
        client = await create(
            // nome da sessão
            botConfig.baseName,
            // recuperando dados do qr code, se existir.
            (base64Qr, asciiQR, attempts, urlCode) => {
                /**
                 * se o valor da variável base64Qr for verdadeiro, significa que o usuário se
                 * desconectou no smartphone, nesse caso podemos excluir a pasta token, se ela existrir,
                 * e salvar as novas configurações de browsertoken
                 */
                /* GANBIARRA FUNCIONAL */
                if (base64Qr) {
                    log('Aparelho desconectado')
                    // checando se a pasta tokens existe
                    if (check(path)) {
                        log('Removendo arquivo da sessão na pasta tokens')
                        unlink(sessionPath, (err) => {
                            if (err) console.log('Arquivo inexistente: ', err)
                            else log('Arquivo de sessão removido da pasta token.\n')
                        })
                    }
                }
            },
            // status da sessão
            (statusSession, sessionName) => {
                console.log('STATUS SESSION: ', statusSession)
                console.log('SESSION NAME: ', sessionName)
            },
            // opções de criação
            {
                multidevice: false,
                disableWelcome: true
            },
            // parametros de criação da sessão - esse parâmetro pode ser undefined
            browserSessionToken
        )
        // inicializando o bot
        run(client)
    } catch (error) {
        console.log('\x1b[31m', 'Erro ao criar a sessão')
    }
    log({ browserSessionToken })
}

/**
 * OBS
 * Para capturar o is do botão na mensagem de resposta,
 * utilize a propriedade selectedButtonId em message.selectedButtonId
 */