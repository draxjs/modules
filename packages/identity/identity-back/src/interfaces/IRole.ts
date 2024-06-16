import {mongoose} from "@drax/common-back";
import {IID} from "./IID";

interface IRole{
    id?: IID
    name: string
    permissions: string[] | string
    childRoles?: mongoose.Types.ObjectId[] | string
    readonly: boolean | number
}

export {IRole}
