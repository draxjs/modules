import {ITenant} from './ITenant'
import {IPaginateFilter, IPaginateResult} from "@drax/common-back";
import {IID} from "./IID";
interface ITenantRepository{
    create(role: ITenant): Promise<ITenant>;
    update(id: IID, updatedRole: ITenant): Promise<ITenant | null>;
    delete(id: IID): Promise<boolean>;
    findById(id: IID): Promise<ITenant | null>;
    findByName(name: string): Promise<ITenant | null>;
    fetchAll(): Promise<ITenant[]>;
    paginate(page?: number, limit?: number, search?:string, filters?: IPaginateFilter[]): Promise<IPaginateResult>;
    table?():void
}

export {ITenantRepository}
