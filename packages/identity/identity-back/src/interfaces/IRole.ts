import {mongoose} from "@drax/common-back";
import {UUID} from "crypto";

interface IRole{
    id?: mongoose.Types.ObjectId | UUID
    name: string
    permissions: string[]
    childRoles?: mongoose.Types.ObjectId[]
    readonly: boolean
}

export {IRole}
