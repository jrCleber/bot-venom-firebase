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
// importandp firestore para tipagem
import { database, firestore } from 'firebase-admin'

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

// gerenciamento de ordem
const manageOrder = {
    // validando a quantidade
    async validateQuantity(message: Message, cliente: Whatsapp) {
        // enviando visualização
        seeTyping(cliente, message.from)
        // recuperando dados de status e pedidos da collection de controle
        const documentData = await chatControll.getDocumetId(message.chatId)
        // alocando lista de pedidos na valiável
        let orderList: TOrder[] = documentData?.data().listOrder
        // capturando o index do último pedido configurado pelo cliente
        const index = orderList.length - 1
        // alocando a última orderm configurada pelo cliente
        let order: TOrder = orderList[index]
        // no message.body recebemos aquantidade
        // agora checaresmos se a quantidade recebidade é realmente um número inteiro, onforme definido na regra de negócio
        // e se esse número é maior que zero
        if (Number.isInteger(parseInt(message.body)) && parseInt(message.body) > 0) {
            // preenchendo a quantidade na orderm
            order.quantity = parseInt(message.body)
            // recolocando ordem na lista
            orderList[index] = order
            // salvando orden no bando
            chatControll.insertDocWithId(message.chatId, { orderList }, false)
            // perguntando se o cliente deseja adicionar um novo item
            cliente.sendButtons(
                message.from,
                'Você deseja adcionar um novo item ao pedido?',
                createButtons(buttons.buttonsAddItemOrder),
                botConfig.botName
            )
                .then(result => {
                    cliente.stopTyping(message.from)
                    // alterando subestágio para addOrder
                    chatControll.updateDoc(message.chatId, 'subState', 'addOrder', false)
                })
                .catch(err => console.log('Erro ao enviar - f validateQuantity - true: ', err))
        } else {
            // informando para o cliente que a quantidade digitada é inválida
            cliente.sendButtons(
                message.from,
                `Então🤨! A quantidade digitada para o produto *${order.title}* deve ser um número, e deve ser  maior que zero.\n
                ⚠ *ATENÇÃO* ⚠
                ❱❱ DIGITE UM VALOR *NUMÉRICO INTEIRO*
                ➥ *Ex: 2*\n
                Ou clique no botão e cancele o pedido.`.replace(/^ +/gm, ''),
                createButtons(buttons.buttonCancell),
                botConfig.botName
            )
                .then(result => cliente.stopTyping(message.from))
                .catch(err => console.log('Erro ao enviar - f validateQuantity - false: ', err))
        }

    },
    // adicionando item ao pedido
    async addOrder(message: Message, cliente: Whatsapp) {
        // chamando a função initOrder para apresentar novamente os item para o cliente
        manageChat.initOrder(message, cliente)
    }
}

// gerenciamento de chat
const manageChat = {
    // iniciando o atendimento a partir de qualquer mensagem recebida
    async initChat(message: Message, client: Whatsapp) {
        seeTyping(client, message.chatId)

        // capturando informações de contato
        const contact = message.sender

        // coletando os dados do cliente
        const data = {
            name: contact.notifyName,
            // caso a propriedade 'imgFull' do ogjeto 'profilePicThumbObj', retorne um valor inválido,
            // preencheremos o campo com uma string vazia
            profilePicThum: contact.profilePicThumbObj.imgFull || '',
            isBusiness: contact.isBusiness
        }

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
    async openOrder(message: Message, client: Whatsapp) {
        seeTyping(client, message.from)
        // regex para validação do item de menu recebido
        const regex = new RegExp(/((^[\w\dà-ú' ]+)R\$(\d+\.\d+))\n([\wà-ú ,\.\(\)\-\+\*]+)$/i)
        // validando item recebido
        let existItem = false
        if (regex.test(message.body)) {
            // realizando o match no message.body
            const arrayMatch = message.body.match(regex)
            // preenchendo ordem
            let order: TOrder = {
                title: arrayMatch![2].trim(),
                price: parseFloat(arrayMatch![3]),
                description: arrayMatch![4]
            }
            // fazendo a varedura no menu e verificando se o item recebido existe
            for (let i = 0; i < menuList.length; i++) {
                const item = menuList[i]
                for (let j = 0; j < item.rows.length; j++) {
                    const row = item.rows[j]
                    if (order.title === row.title && order.price === row.price && order.description === row.description) {
                        order.category = item.category
                        // certificando que o item existe
                        existItem = true
                        // verificando se existe item noa array temp
                        const documentData = await chatControll.getDocumetId(message.chatId)
                        if (documentData?.exists) {
                            const fieldValue = firestore.FieldValue
                            chatControll.updateDoc(message.chatId, 'orderList', fieldValue.arrayUnion(order), false)
                            break
                        } else {
                            // salvando item no banco na collection de de controle de chat de forma temporal
                            // quando o pedido for finalizado, a ordem será salva na collection order
                            // os dados da collection de controle serão apagados para o início de uma nova ordem
                            const orderList = [order]
                            chatControll.insertDocWithId(message.chatId, { orderList }, false)
                            break
                        }
                    }
                    if (existItem) break
                }
            }
            // verificando se o item existe
            // essa verificação identifica se o item foi clicado ou se o item foi digitado
            if (existItem) {
                // enviar mensagem para o cliente preencher a quantidade
                client.sendButtons(
                    message.from,
                    `Digite agora a quantidade para o produto *${order.title}*\n
                    ⚠ ATENÇÃO ⚠
                    ❱❱❱ DIGITE UM VALOR NUMÉRICO INTEIRO
                    ➥ Ex: 2\n
                    Ou clique no botão e cancele o pedido.`.replace(/^ +/, ''),
                    createButtons(buttons.buttonCancell),
                    botConfig.botName
                )
                    .then(result => {
                        client.stopTyping(message.from)
                        // setando um substágio para o cliente
                        // isso significa que enquanto a ordem estiver aberta {checkState: 'openOrder'}
                        // iremos gerenciar o pedido do cliete com subestágios
                        // o subestágio a seguir é 'quantity' => quantidade
                        // portanto iremos validar a quantidade informada pelo cliente
                        chatControll.insertDocWithId(message.chatId, { subState: 'validateQuantity' }, false)
                    })
                    .catch(err => console.log('Erro ao enviar mensagend de solicitação de quantidade\n--f openOrder: ', err))
            } else if (existItem === false) {
                // informar para o cliente que o item que ele digitou não se encontra nos parâmetros
                // solicitando que o cliente escolha novamente o o item do menu
                client.sendListMenu(
                    message.from,
                    botConfig.companyName.toUpperCase(),
                    'menu',
                    `Então🤨! Esse item que você digitou,
                    *(* ${order.title} *)*
                    Não existe no cardápio.\n
                    Cique no *botão* para abrir o cadápio e selecione um item:`.replace(/^ +/, ''),
                    'cardápio'.toUpperCase(),
                    createListMenu()
                )
                    .then(result => client.stopTyping(message.from))
                    .catch(err => console.log('Erro ao enviar menu - f openOrder: ', err))
            }
        }

        // recuperando subestágio do cliente
        const state = await chatControll.getDocumetId(message.chatId)
        const subState = state?.database().subState as keyof typeof manageOrder
        // intanciando função no obj menageOrder
        const orderManagement = manageOrder[subState]
        // verificando se a referência da função é verdadeira e a executando 
        if (orderManagement !== undefined) {
            orderManagement(message, client)
        }
    }
}

export default manageChat