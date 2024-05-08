import {IRole} from './IRole'
interface IRoleRepository{
    create(role: IRole): Promise<IRole>;
    update(_id: any, updatedRole: IRole): Promise<IRole | null>;
    delete(_id: any): Promise<boolean>;
    findById(_id: any): Promise<IRole | null>;

    paginate(query: any, options: any): any;
}

export {IRoleRepository}
