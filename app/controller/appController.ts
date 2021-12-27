import { DbConn } from '../../connections/dbConnection'
import { firestore } from 'firebase-admin'

// criando o controller que fará o CRUD
export class AppController {
    constructor(
        public collection: string
    ) { }

    // passando o nome da collection 
    private readonly _db = new DbConn(this.collection).instance.firestore()

    // retornando todos os documentos da collection
    async getAllDocuments(): Promise<firestore.QueryDocumentSnapshot<firestore.DocumentData>[] | null> {
        try {
            const querySnapshots = await this._db.collection(this.collection).get()
            return querySnapshots.docs
        } catch (error) {
            console.log('Erro durante a busca - getAllDocuments: ', error)
            return null
        }
    }

    // retornado documento pelo id
    async getDocumetId(idDoc: string): Promise<firestore.DocumentData | null | undefined> {
        try {
            const documentReference = await this._db.collection(this.collection).doc(idDoc).get()
            return documentReference.data()
        } catch (error) {
            console.log('Erro durante a busca - getDocumetId: ', error)
            return null
        }
    }

    // recuperando documento pelo id com a cláusula where
    async getDocumentIdWhere(
        field: string | firestore.FieldPath,
        opStr: firestore.WhereFilterOp,
        value: any
    ): Promise<firestore.DocumentData | null | undefined> {
        try {
            const documentReference = await this._db.collection(this.collection)
                .where(field, opStr, value)
                .get()
            return documentReference.docs
        } catch (error) {
            console.log('Erro durante a busca - getDocumentIdWhere: ', error)
            return null
        }
    }

    // inserção com id dinâmico
    async insertDoc(data: any): Promise<string> {
        try {
            // adicionando registro temporal no cadastro
            data.dateTime = firestore.Timestamp.now()
            // retorna o id do documento gerado de forma dinâmica
            const documentReference = await this._db.collection(this.collection).add(data)
            return documentReference.id
        } catch (error) {
            console.log('Erro ao inserir - insertDoc: ', error)
            return ''
        }
    }

    // inserção com id definido
    insertDocWithId(idDoc: string, data: any, insertDate = true) {
        try {
            // adicionando registro temporal no cadastro
            if (insertDate) {
                data.dateTime = firestore.Timestamp.now()
            }
            this._db.collection(this.collection).doc(idDoc).set(data)
                .then(result => console.log('Documento inserido: ', result))
        } catch (error) {
            console.log('Erro ao inserir - insertDocWithId: ', error)
        }
    }

    // atualizar um documento
    updateDoc(idDoc: string, field: string, fieldValue: any, insertDate = true) {
        try {
            let data = { [field]: fieldValue }
            // adicionando registro temporal no cadastro
            if (insertDate) {
                data.dateTime = firestore.Timestamp.now()
            }
            this._db.collection(this.collection).doc(idDoc).update(data)
        } catch (error) {
            console.log('Erro ao atualizar documento - updateDoc: ', error)
        }
    }
}