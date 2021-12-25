import { Message, Whatsapp } from "venom-bot"
import { opendir } from 'fs/promises'
// importando configurações de botões
import buttons from '../settings/actionsBot.json'
// importando as configurações do bot
import botConfig from '../settings/settingsBot.json'
// importando o controller da aplicação
import { AppController } from "../controller/appController"
// importando arquivo de dados, estático, para criação do menu
import menuList from '../data/menuList.json'
//importando nome das collections
import collection from '../data/collectionsNames.json'
// importando interfaces
import { TRowsMenu, TButtons, TOrder } from '../models/types'

// formatando botão
function createButtons(array: string[]) {
    const listButton: TButtons = []
    array.forEach(b => {
        listButton.push({
            buttonText: {
                displayText: b
            }
        })
    })
    return listButton
}

// formatando menuList
function createListMenu() {
    // criando uma lista única de categorias
    const category = [...new Set(menuList.map(m => m.category))]
    // formatando
    return Array.from(category, c => {
        const rows: TRowsMenu = []
        const title = c.toUpperCase()
        menuList.forEach(m => {
            if (m.category === c) {
                m.rows.forEach(r => {
                    rows.push({
                        title: `${r.title} ${r.price.toLocaleString('us', { style: 'currency', currency: 'BRL' })}`,
                        description: r.description
                    })
                })
            }
        })
        return { title, rows }
    })
}

function seeTyping(client: Whatsapp, from: string) {
    client.sendSeen(from)
    client.startTyping(from)
}

// definindo nome das collections
const [collOrder, collCustomer, collChatControll] = ['order', 'customer', 'chatControll']

// instanciando controller que gerenciaram as collections
const orderControll = new AppController(collection.collOrder)
const customerControll = new AppController(collection.collCustomer)
const chatControll = new AppController(collection.collChatControll)

// debug
const log = (value: any) => console.log(value)

// gerenciamento de chat
const manageChat = {
    // iniciando o atendimento a partir de qualquer mensagem recebida
    async initChat(message: Message, client: Whatsapp) {
        seeTyping(client, message.chatId)

        // capturando informações de contato
        const contact = message.sender

        const data = {
            name: contact.notifyName,
            profilePicThum: contact.profilePicThumbObj.imgFull || null,
            isBusiness: contact.isBusiness
        }

        log(data)

        // gravando dados no firebase
        // collection - person
        customerControll.insertDocWithId(contact.id, data)

        // setando estágio do cliente
        // collection - chatControll
        const state = { codeState: 'initChat' }
        chatControll.insertDocWithId(message.chatId, state, false)

        client.sendButtons(
            message.from,
            `Olá! Bem vindo ao *${botConfig.companyName}*😁!
            Eu sou o *${botConfig.botName}*, e estou aqui para te auxiliar no seu atendimento.
            Como posso te ajudar?`.replace(/^ +/gm, ''),
            createButtons(buttons.buttonsListInit),
            botConfig.shortName
        )
            .then(result => {
                client.stopTyping(message.from)
                // checando resultado do envio da mensagem
                console.log('Resultado: ', result)
            })
            .catch(err => console.error('Erro - f initChat: ', err))
    },
    // enviando o cardápio em imagem
    async sendMenu(message: Message, client: Whatsapp) {
        seeTyping(client, message.from)
        const path = './app/assets'
        const dir = await opendir(path)
        let page = 1
        for await (const dirent of dir) {
            client.sendImage(message.from, `${path}/${dirent.name}`, `Página *${page}*`)
                .then(result => console.log('Succsses - f sendMenu: ', result))
                .catch(err => console.log('Error - f sendMenu image: ', err))
        }
        client.sendButtons(
            message.from,
            'Quandp estiver pronto,\nclique em *Fazer um pedido* para continuarmos o atendimento',
            createButtons(buttons.buttonsViewMenu),
            botConfig.shortName
        )
            .then(result => client.stopTyping(message.from))
            .catch(err => console.error('Error - f sendMenu buttons: ', err))
    },
    // outar opções de chat - não serão implementadas
    otherOptions(message: Message, client: Whatsapp) {
        seeTyping(client, message.from)
        client.sendButtons(
            message.from,
            'Em que mais eu posso te ajudar?🤔',
            createButtons(buttons.buttonsOtherOptions),
            botConfig.shortName
        )
            .then(result => client.stopTyping(message.from))
            .catch(err => console.log('Erro - f otherOptions: ', err))
    },
    // chamando o bot
    callBot(message: Message, client: Whatsapp) {
        seeTyping(client, message.from)
        client.sendButtons(
            message.from,
            `Ooooiii! Você me chamou!?🧐
            No que eu posso te ajudar?`,
            createButtons(buttons.buttonsListInit),
            botConfig.shortName
        )
            .then(result => client.stopTyping(message.from))
            .catch(err => console.error('Erro - f callBot: ', err))
    },
    // abrindo ordem
    initOrder(message: Message, client: Whatsapp) {
        seeTyping(client, message.from)

        // atualizando o estágio onde o cliente se encontra no gerenciamento do atendimento
        chatControll.updateDoc(message.chatId, 'codeState', 'openOrder', false)

        client.sendListMenu(
            message.from,
            botConfig.companyName.toUpperCase(),
            'menu',
            'Clique no botão para abrir o cardápio!',
            'Cardápio'.toUpperCase(),
            createListMenu()
        )
            .then(result => {
                client.stopTyping(message.from)
                // checando resultado do envio da mensagem
                console.log('Resultado: ', result)
            })
            .catch(err => console.error('Erro - f initOrder', err))
    },
    openOrder(message: Message, client: Whatsapp) {
        seeTyping(client, message.from)
        // regex para validação do item de menu recebido
        const regex = new RegExp(/((^[\w\dà-ú' ]+)R\$(\d+\.\d+))\n([\wà-ú ,\.\(\)\-\+\*]+)$/i)
        // validando item recebido
        let existItem = false
        if (regex.test(message.body)) {
            // realizando o match no message.body
            const arrayMatch = message.body.match(regex)
            // preenchendo ordem
            let order : TOrder = {
                title: arrayMatch![2].trim(),
                price: parseFloat(arrayMatch![3]),
                description: arrayMatch![4]
            }
            // fazendo a varedura no menu e verificando se o item recebido existe
            for(let i = 0; i < menuList.length; i++){
                const item = menuList[i]
                for(let j = 0; j < item.rows.length; j++){
                    const row = item.rows[j]
                    if(order.title === row.title && order.price === row.price && order.description === row.description){
                        order.category = item.category
                        // certificando que o item existe
                        existItem = true
                        // salvando item no banco na collection de de controle de chat de forma temporal
                        // quando o pedido for finalizado, a ordem será salva na collection order
                        // os dados da collection de controle serão apagados para o início de uma nova ordem
                        const data = {listOrder: [order]}
                        chatControll.insertDocWithId(message.chatId, data, false)
                        break
                    }
                    if(existItem) break
                }
            }

            // verificando se o item existe
            // essa verificação identifica se o item foi clicado ou se o item foi digitado
            if(existItem){
                // enviar mensagem para o cliente preencher a quantidade
            } else if (existItem === false){
                // informar para o cliente que o item que ele digitou não se encontra nos parâmetros
            }
        }
    }
}

export default manageChat