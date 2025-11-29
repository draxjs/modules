import type {IRole, ITenant} from "@drax/identity-share";

interface IAuthFullUser {
    id: string
    username: string
    email: string
    active: boolean
    name: string
    phone: string
    avatar: string
    role: IRole
    tenant?: ITenant
}

export type {IAuthFullUser}
