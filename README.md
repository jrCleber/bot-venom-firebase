## bot-venom-firebase

# Bot de Atendimento Via Whatsapp

Esse projeto foi desenvolvido tendo como base, a bilioteca [orkestral/venom](https://github.com/orkestral/venom) para a manipulação de chats do whatsapp, e utiliza o **Firestore**, banco de dados **NoSql** do **Firebase**.

<hr>

## Objetivo
Esta aplicação tem como objetivo o atendimento automatizado e o gerenciamento do pedido

### Funções
1. cadastro de clientes
2. gerenciamento dos pedidos
3. cadastro de endereço
4. cadastro do pedido e envio para a produção
5. cancelamento do pedido
<hr>

### Para executar o projeto
1. execute o comando: ```git clone https://github.com/jrCleber/bot-venom-firebase.git```
2. crie um [novo projeto](https://console.firebase.google.com/) no firebase, selecione o [firestore](https://console.firebase.google.com/project/webbot-dbc99/firestore) e configure o banco de dados
    * depois clique em **configurações do projeto -> [contas e serviços](https://console.firebase.google.com/project/webbot-dbc99/settings/serviceaccounts/adminsdk) -> gerar uma nova chave privada**
    * salve a chave na pasta **keys** com o seguinte nome: **serviceAccountKey.json**
3. instale as dependências:
    * com gerenciador de pacores **yarn**, execute o comando: ```yarn``` ou ```yarn install```
    * com o **npm**, execute o comando: ```npm install```
4. para iniciar o aplicativo:
    * com o **yarn** execute: ```yarn start:app```
    * com o **npm** execute: ```npm run start:app```<br/>
    ↳ ambos os comandos acima irão criar transpilar o código, o salvando na pasta dist
    * ```yarn dev``` ou ```npm run dev``` irão executar o código no modo desenvolvedor; com a transpilação do código em tempo de execução    
5. Tudo certo agora. **DIVIRTA-SE**!
<hr>

Essa aplicação não realiza o gerenciamento de pagamentos, roteamentos para atendentes e edições em gerais.
<br/>

**ApiWhatsAppSender:** https://api.whatsapp.com/send?phone={seu número}
