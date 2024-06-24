import type {ITenant, ITenantBase} from "./ITenant";
import type {IPaginateClient} from "@drax/common-front";

interface ITenantProvider {
    fetchTenant(): Promise<ITenant[]>
    paginateTenant(page: number, limit: number, search:string): Promise<IPaginateClient<ITenant>>
    createTenant(input: ITenantBase): Promise<ITenant>
    editTenant(id: string, input: ITenantBase): Promise<ITenant>
    deleteTenant(id: string): Promise<any>
}

export type {ITenantProvider}
