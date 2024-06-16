import {mongoose} from "@drax/common-back";

interface IRole{
    id?: mongoose.Types.ObjectId
    name: string
    permissions: string[]
    childRoles?: mongoose.Types.ObjectId[]
    readonly: boolean
}

export {IRole}
