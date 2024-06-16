import {mongoose} from "@drax/common-back";
import {IID} from "./IID";

interface IRole{
    id?: IID
    name: string
    permissions: string[]
    childRoles?: mongoose.Types.ObjectId[]
    readonly: boolean
}

export {IRole}
