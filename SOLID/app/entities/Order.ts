import {uuid} from 'uuidv4'
import { Customer } from './Customer'

export class Order {

    public readonly id: string
    public customer: Customer
    public listOrder: []
}