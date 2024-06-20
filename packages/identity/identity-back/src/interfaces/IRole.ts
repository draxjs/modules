import {mongoose} from "@drax/common-back";
import {IID} from "./IID";

type IPermissions = string[] | string;

interface IRoleBase{
    id: IID
    name: string
    permissions: string[]
}

interface IRole{
    id?: IID
    name: string
    permissions: IPermissions
    childRoles?: mongoose.Types.ObjectId[] | string
    readonly: boolean | number
}


export {IRole, IRoleBase, IPermissions}
