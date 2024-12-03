import {IUser} from "./IUser";

interface IUserGroupBase{
    name: string
    users: string[]
}


interface IUserGroup{
    id: string
    name: string
    users: IUser[]
}

export {IUserGroup, IUserGroupBase}
