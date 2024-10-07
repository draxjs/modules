import type {ITenant, ITenantBase} from "@drax/identity-share";
import type {IDraxCrud} from "@drax/crud-share";

interface ITenantProvider extends IDraxCrud<ITenant, ITenantBase, ITenantBase> {
    fetchTenant(): Promise<ITenant[]>
}

export type {ITenantProvider}
