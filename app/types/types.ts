import {firestore} from 'firebase-admin'

export type TRowsMenu = {
    title: string,
    description: string
}[]

export type TButtons = {
    buttonText: {
        displayText: string
    }
}[]

export type TOrder = {
    title: string,
    price: number,
    description: string,
    quantity?: number,
    category?: string,
}