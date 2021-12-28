import {Customer} from '../entities/Customer'

export interface ICustomerRepository {
    findByCahtId(chatId: string): Promise<Customer>
    save(customer: Customer): Promise<void>
    update(customer: Customer): Promise<void>
    delete(customer: Customer): Promise<void>
}