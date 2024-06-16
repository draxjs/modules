import {IUser} from './IUser'
interface IUserRepository{
    create(role: IUser): Promise<IUser>;
    update(id: any, updatedRole: IUser): Promise<IUser | null>;
    delete(id: any): Promise<boolean>;
    findById(id: any): Promise<IUser | null>;
    findByUsername(username: string): Promise<IUser | null>;
    paginate(query: any, options: any): any;
}

export {IUserRepository}
