import {IRole} from './IRole'
import {IPaginateFilter, IPaginateResult} from "@drax/common-back";
import {IID} from "./IID";
interface IRoleRepository{
    create(role: IRole): Promise<IRole>;
    update(id: IID, updatedRole: IRole): Promise<IRole | null>;
    delete(id: IID): Promise<boolean>;
    findById(id: IID): Promise<IRole | null>;
    findByName(name: string): Promise<IRole | null>;
    fetchAll(): Promise<IRole[]>;
    paginate(page?: number, limit?: number, search?:string, filters?: IPaginateFilter[]): Promise<IPaginateResult>;
    table?():void
}

export {IRoleRepository}
