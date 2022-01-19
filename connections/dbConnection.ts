import * as admin from 'firebase-admin'
import key from '../keys/serviceAccountKey.json'

/**
 * configurando a connexão com o banco de dados
 * @AccountKey https://console.firebase.google.com/u/0/project/webbot-dbc99/settings/serviceaccounts/adminsdk
 */
export class DbConn {
    constructor(
        public nameApp?: string,
        private readonly _serviceAccountKey: admin.ServiceAccount = {
            privateKey: key.private_key,
            projectId: key.project_id,
            clientEmail: key.client_email
        },
        /**
         * a função initializeApp recebe dois parâmetros
         * 1 - objeto para a inicialização do DbConn
         * 2 (opcional) - "name": o name é utilizado para diferenciar as instâncias e evitar conflitos
         */
        public readonly instance = admin.initializeApp(
            { credential: admin.credential.cert(_serviceAccountKey) },
            nameApp?.split('').sort(() =>  0.5-Math.random()).join('')
        ).firestore()
    ) { }
}