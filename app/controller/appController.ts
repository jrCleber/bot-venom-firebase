import { DbConn } from '../../connections/dbConnection'
import { firestore } from 'firebase-admin'

/**
 * criando o controller que fará o CRUD
 * @AddData https://firebase.google.com/docs/firestore/manage-data/add-data#set_a_document
 * @UpdateData https://firebase.google.com/docs/firestore/manage-data/add-data#update-data
 * @GetData https://firebase.google.com/docs/firestore/query-data/get-data#get_a_document
 * @GedAllData https://firebase.google.com/docs/firestore/query-data/get-data#get_multiple_documents_from_a_collection
 * @SimpleQuery https://firebase.google.com/docs/firestore/query-data/queries#simple_queries
 * @QueryOperators https://firebase.google.com/docs/firestore/query-data/queries#query_operators
 * @CompoundQueries https://firebase.google.com/docs/firestore/query-data/queries#compound_queries
*/
export class AppController {
    constructor(
        public collection: string
    ) { }

    // passando o nome da collection 
    private readonly _db = new DbConn(this.collection).instance

    /**
     * retornando todos os documentos da collection     * 
     * @returns retorna uma lista dom todos os documetos da collection
     */
    async getAllDocuments(): Promise<firestore.QueryDocumentSnapshot<firestore.DocumentData>[] | null> {
        try {
            const querySnapshots = await this._db.collection(this.collection).get()
            return querySnapshots.docs
        } catch (error) {
            console.log('Erro durante a busca - getAllDocuments: ', error)
            return null
        }
    }

    /**
     * retornado documento pelo id     * 
     * @param idDoc uma string contendo o id do documento a ser retornado
     * @returns retorna o documento encontrado ou null
     */
    async getDocumetId(idDoc: string): Promise<firestore.DocumentData | null> {
        try {
            const documentReference = await this._db.collection(this.collection).doc(idDoc).get()
            return documentReference
        } catch (error) {
            console.log('Erro durante a busca - getDocumetId: ', error)
            return null
        }
    }

    /**
     * recuperando documento pelo id com a cláusula where     * 
     * @param field nome do campo para realizar a comparação
     * @param opStr operadores de comparação === | == | >= | <= | !== | != | array-contains | array-contains-any | in | not-in
     * @Docs https://firebase.google.com/docs/firestore/query-data/queries
     * @param value valor a ser comparado podem ser dos tipos string | boolen | number | null | array | map
     * @returns retorna uma lista com os documentos encontrados
     */
    async getDocumentWhere(
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

    /**
     * inserção com id dinâmico     * 
     * @param data um objeto do tipo { key: value } - onde key: string e value: string | boolen | number | null | array | map
     * mas lembre-se: nem um desses valores pode ser do tipo undefined ou conter um undefined. O tipo undefined não é suportado pelo firebase
     * @returns retorna o id gerado dinamicamente pelo banco
     */
    async insertDoc(data: any): Promise<string> {
        try {
            // adicionando registro temporal no cadastro
            data.createAt = firestore.FieldValue.serverTimestamp()
            // retorna o id do documento gerado de forma dinâmica
            const documentReference = await this._db.collection(this.collection).add(data)
            return documentReference.id
        } catch (error) {
            console.log('Erro ao inserir - insertDoc: ', error)
            return ''
        }
    }

    /**
     * inserção com id definido     * 
     * @param idDoc uma string que referencia o documento a ser deletado
     * @param data um objeto do tipo { key: value } - onde key: string e value: string | boolen | number | null | array | map
     * mas lembre-se: nem um desses valores pode ser do tipo undefined ou conter um undefined. O tipo undefined não é suportado pelo firebase
     * @param insertDate um valor booleano que determina a incerção de um timestamp no documento
     * @default insertDate = true
     */
    insertDocWithId(idDoc: string, data: any, insertDate: boolean = true): void {
        try {
            // adicionando registro temporal no cadastro
            if (insertDate) {
                data.createAt = firestore.FieldValue.serverTimestamp()
            }
            this._db.collection(this.collection).doc(idDoc).set(data)
                .then(result => console.log('Documento inserido: ', result))
        } catch (error) {
            console.log('Erro ao inserir - insertDocWithId: ', error)
        }
    }

    /**
     * atualizar um documento     * 
     * @param idDoc uma string que referencia o documento a ser deletado
     * @param field nome do campo a ser atualizado no documento
     * @param fieldValue um valor que deve ser do tipo string | boolen | number | null | array | map
     * mas lembre-se: nem um desses valores pode ser do tipo undefined ou conter um undefined. O tipo undefined não é suportado pelo firebase
     * @param insertDate um valor booleano que determina a incerção de um timestamp no documento
     * @default {boolean} insertDate = true
     * @returns retorna um documento com o resultado da atualização
     */
    async updateDoc(idDoc: string, field: string, fieldValue: any, insertDate: boolean = true): Promise<firestore.WriteResult | undefined> {
        try {
            let data = { [field]: fieldValue }
            // adicionando registro temporal no cadastro
            if (insertDate) {
                data.updateAt = firestore.FieldValue.serverTimestamp()
            }
            const writeResult = await this._db.collection(this.collection).doc(idDoc).update(data)
            return writeResult
        } catch (error) {
            console.log('Erro ao atualizar documento - updateDoc: ', error)
        }
    }

    /**
     * atualizando vários campos de um vez
     * esta função não isere no banco o date time da atualização automaticamente.
     * você insere nos campos que quer atualizar por ex:
        const manyFields = {
            name: 'seu nome',
            sobreNome: 'seu sobre nome',
            dataAtualizacao: Date.now() || new Date() || firestore.FieldValue.serverTimestamp()
        }
        updateManyFields('seu id', manyFields)      
     * @param idDoc uma que string referencia o documento a ser atualizado
     * @param manyFields um objeto do tipo { key: value } como parâmetros para a atualização
     * @returns} retorna um documento com o resultado da atualização
     */
    async updateManyFields(idDoc: string, manyFields: any): Promise<firestore.WriteResult | undefined> {
        try {
            const writeResult = await this._db.collection(this.collection).doc(idDoc).update(manyFields)
            return writeResult
        } catch (error) {
            console.log('Erro ao atualizar documento - updateManyFields: ', error)
        }
    }

    /**
     * deletando um documento     * 
     * @param idDoc uma string que referencia o documento a ser deletado
     * @returns retorna um documento com o resultado da deleção
     */
    async deleteDoc(idDoc: string): Promise<firestore.WriteResult | undefined> {
        try {
            const res = await this._db.collection(this.collection).doc(idDoc).delete()
            return res
        } catch (error) {
            console.log('Erro ao deletar documento - deleteDoc: ', error)
        }
    }
}