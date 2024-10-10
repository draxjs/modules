import type {IUser, IUserCreate, IUserUpdate} from "@drax/identity-share";
import type {IDraxCrudProvider} from "@drax/crud-share";


interface IUserProvider extends IDraxCrudProvider<IUser, IUserCreate, IUserUpdate>{
    changeUserPassword(id: string, newPassword: string): Promise<boolean>
}

export type {IUserProvider}
