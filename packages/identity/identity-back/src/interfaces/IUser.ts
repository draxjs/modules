import {mongoose} from "@drax/common-back";
import {IRole} from "./IRole";
import {IUserGroup} from "./IUserGroup";
import {IID} from "./IID";

interface IUser {
    id?: IID
    username: string
    email: string
    password: string
    active: boolean | number
    name?: string
    phone?: string
    avatar?: string
    avatarurl?: string
    code?: string
    role: IID | IRole
    groups: mongoose.Types.ObjectId[] | IUserGroup[]

    toObject(): IUser;
}

export {IUser}
