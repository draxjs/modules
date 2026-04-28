
interface IGroupZoneBase {
    name: string
    users?: Array<any>
    createdAt?: Date
    updatedAt?: Date
}

interface IGroupZone {
    _id: string
    name: string
    users?: Array<any>
    createdAt?: Date
    updatedAt?: Date
}

export type {
IGroupZoneBase, 
IGroupZone
}
