import type {ITenant, ITenantBase} from "@drax/identity-share";
import type {IDraxCrudProvider} from "@drax/crud-share";

interface ITenantProvider extends IDraxCrudProvider<ITenant, ITenantBase, ITenantBase> {
    fetchTenant(): Promise<ITenant[]>
}

export type {ITenantProvider}
