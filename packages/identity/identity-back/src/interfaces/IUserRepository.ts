import {IUser, IUserCreate, IUserUpdate} from './IUser'
import {IPaginateFilter, IPaginateResult} from "@drax/common-back";
import {IID} from "./IID";
interface IUserRepository{
    create(role: IUserCreate): Promise<IUser>;
    update(id: IID, updatedRole: IUserUpdate): Promise<IUser | null>;
    delete(id: IID): Promise<boolean>;
    findById(id: IID): Promise<IUser | null>;
    findByUsername(username: string): Promise<IUser | null>;
    paginate(page?: number, limit?: number, search?: string, filters?: IPaginateFilter[]): Promise<IPaginateResult>;
    changePassword(id: IID, password:string):Promise<Boolean>;
    table?():void

}

export {IUserRepository}
