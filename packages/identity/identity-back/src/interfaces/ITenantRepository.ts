import {ITenant, ITenantBase} from '@drax/identity-share'
import {IDraxCrudRepository} from "@drax/crud-share";
interface ITenantRepository extends IDraxCrudRepository<ITenant,ITenantBase,ITenantBase>{
    findById(id: string): Promise<ITenant | null>;
    findByName(name: string): Promise<ITenant | null>;
    fetchAll(): Promise<ITenant[]>;
}

export {ITenantRepository}
