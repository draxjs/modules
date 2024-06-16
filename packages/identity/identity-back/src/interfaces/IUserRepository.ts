import {IUser} from './IUser'
import {IPaginateFilter, IPaginateResult} from "@drax/common-back";
interface IUserRepository{
    create(role: IUser): Promise<IUser>;
    update(id: any, updatedRole: IUser): Promise<IUser | null>;
    delete(id: any): Promise<boolean>;
    findById(id: any): Promise<IUser | null>;
    findByUsername(username: string): Promise<IUser | null>;
    paginate(page?: number, limit?: number, filters?: IPaginateFilter[]): Promise<IPaginateResult>;
}

export {IUserRepository}
