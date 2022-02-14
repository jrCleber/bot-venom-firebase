import { firestore } from "firebase-admin"

export type TRowsMenu = {
    title: string,
    description: string,
    rowId: string
}

export type TSections = {
    title: string,
    rows: TRowsMenu[]
}

export type TButtons = {
    buttonText: {
        displayText: string
    },
    type: 1,
    buttonId: string
}

export type TOrder = {
    title: string,
    price: number,
    description: string,
    quantity?: number,
    category?: string,
}

export type TAddress = {
    zipCode?: string,
    city?: string,
    distryct?: string,
    publicPlace?: string,
    number?: string,
}

export type TDataTemp = {
    codeState: string,
    subState: string | firestore.FieldValue,
    tempAddress: TAddress | firestore.FieldValue,
    tempOrderList: TOrder[] | firestore.FieldValue
}

export type TListResponse = {
    title: string,
    listType: number,
    singleSelectReply: {
        selectedRowId: string
    },
    description: string,
}

export type TBrowserSessionToken = {
    WABrowserId: string,
    WASecretBundle: string,
    WAToken1: string,
    WAToken2: string,
}

export type TActionBot = {
    text: string,
    id: string,
}