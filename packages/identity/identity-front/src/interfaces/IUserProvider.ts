import type {IUser, IUserCreate, IUserUpdate} from "@drax/identity-share";
import type {IDraxCrud} from "@drax/crud-share";


interface IUserProvider extends IDraxCrud<IUser, IUserCreate, IUserUpdate>{
    changeUserPassword(id: string, newPassword: string): Promise<boolean>
}

export type {IUserProvider}
