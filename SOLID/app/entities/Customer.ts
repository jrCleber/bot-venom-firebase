import { uuid } from 'uuidv4'

export class Customer {

    public readonly id: string
    public name: string
    public chatId: string
    public urlImageProfile?: string

    constructor(props: Omit<Customer, 'id'>, id?: string) {
        Object.assign(this, props)
        if (!id) this.id = uuid()
    }
}