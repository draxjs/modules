import {IRole} from './IRole'
import {IPaginateFilter, IPaginateResult} from "@drax/common-back";
interface IRoleRepository{
    create(role: IRole): Promise<IRole>;
    update(id: any, updatedRole: IRole): Promise<IRole | null>;
    delete(id: any): Promise<boolean>;
    findById(id: any): Promise<IRole | null>;
    paginate(page?: number, limit?: number, filters?: IPaginateFilter[]): Promise<IPaginateResult>;
}

export {IRoleRepository}
