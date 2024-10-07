import {IUser, IUserCreate, IUserUpdate} from '@drax/identity-share'
import {IDraxCrud} from "@drax/crud-share";

interface IUserRepository extends IDraxCrud<IUser, IUserCreate, IUserUpdate>{
    findById(id: string): Promise<IUser | null>;
    findByUsername(username: string): Promise<IUser | null>;
    changePassword(id: string, password:string):Promise<Boolean>;
    changeAvatar(id: string, avatarUrl: string): Promise<Boolean>;
}

export {IUserRepository}
