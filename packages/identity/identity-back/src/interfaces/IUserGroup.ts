import {mongoose} from "@drax/common-back";
import {IUser} from "./IUser";
import {IID} from "./IID";

interface IUserGroup{
    id?: IID
    name: string
    users: mongoose.Types.ObjectId[] | IUser[]
}

export {IUserGroup}
