import { Customer } from "../../entities/Customer";
import { ICustomerRepository } from "../../repository/ICustomerRepository";
import { ICreateCustomerGetDTO } from "./CreateCustomerDTO";

export class CreateUserUseCase {
    constructor(
        private _customerRepository: ICustomerRepository
    ) { }

    async execute(data: ICreateCustomerGetDTO) {
        const customerAlreadyExists = await this._customerRepository.findByCahtId(data.chatId)

        if (customerAlreadyExists) throw new Error('Customer alread exists')

        const customer = new Customer(data)

        this._customerRepository.save(customer)
            .then(result => console.log('Data saved successfully: ', data))
            .catch(err => console.log('Not saved: ', err))
    }
}