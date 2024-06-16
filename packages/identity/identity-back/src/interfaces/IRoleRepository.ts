import {IRole} from './IRole'
interface IRoleRepository{
    create(role: IRole): Promise<IRole>;
    update(id: any, updatedRole: IRole): Promise<IRole | null>;
    delete(id: any): Promise<boolean>;
    findById(id: any): Promise<IRole | null>;

    paginate(query: any, options: any): any;
}

export {IRoleRepository}
