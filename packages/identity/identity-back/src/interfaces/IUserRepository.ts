import {IUser} from './IUser'
import {IPaginateFilter, IPaginateResult} from "@drax/common-back";
import {IID} from "./IID";
interface IUserRepository{
    create(role: IUser): Promise<IUser>;
    update(id: IID, updatedRole: IUser): Promise<IUser | null>;
    delete(id: IID): Promise<boolean>;
    findById(id: IID): Promise<IUser | null>;
    findByUsername(username: string): Promise<IUser | null>;
    paginate(page?: number, limit?: number, filters?: IPaginateFilter[]): Promise<IPaginateResult>;
}

export {IUserRepository}
