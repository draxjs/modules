import {IUser} from './IUser'
interface IUserRepository{
    create(role: IUser): Promise<IUser>;
    update(_id: any, updatedRole: IUser): Promise<IUser | null>;
    delete(_id: any): Promise<boolean>;
    findById(_id: any): Promise<IUser | null>;
    findByUsername(username: string): Promise<IUser | null>;
    paginate(query: any, options: any): any;
}

export {IUserRepository}
