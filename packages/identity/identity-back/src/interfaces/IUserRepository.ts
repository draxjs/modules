import {IUser, IUserCreate, IUserUpdate} from '@drax/identity-share'
import {IDraxCrudRepository} from "@drax/crud-share";

interface IUserRepository extends IDraxCrudRepository<IUser, IUserCreate, IUserUpdate>{
    findById(id: string): Promise<IUser | null>;
    findByUsername(username: string): Promise<IUser | null>;
    findByUsernameWithPassword(username: string): Promise<IUser | null>;
    findByEmail(email: string): Promise<IUser | null>;
    changePassword(id: string, password:string):Promise<Boolean>;
    changeAvatar(id: string, avatarUrl: string): Promise<Boolean>;

    findByEmailCode(code: string): Promise<IUser | null>;
    findByPhoneCode(code: string): Promise<IUser | null>;
    findByRecoveryCode(code: string): Promise<IUser | null>;
}

export {IUserRepository}
