import {mongoose} from "@drax/common-back";
import {IUser} from "./IUser";

interface IUserGroup{
    id?: mongoose.Types.ObjectId
    name: string
    users: mongoose.Types.ObjectId[] | IUser[]
}

export {IUserGroup}
