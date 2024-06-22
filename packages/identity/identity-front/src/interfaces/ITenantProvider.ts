import type {ITenant} from "./ITenant";
import type {IPaginateClient} from "@drax/common-front";

interface ITenantProvider {
    fetchTenant(): Promise<any>
    paginateTenant(page: number, limit: number, search:string): Promise<IPaginateClient>
    createTenant(input: ITenant): Promise<any>
    editTenant(id: string, input: ITenant): Promise<ITenant>
    deleteTenant(id: string): Promise<any>
}

export type {ITenantProvider}
