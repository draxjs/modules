import type {IRole} from "./IRole";
import type {IPaginateClient} from "@drax/common-front";

interface IRoleProvider {
    fetchRole(): Promise<any>
    fetchPermissions(): Promise<any>
    paginateRole(page: number, limit: number, search:string): Promise<IPaginateClient>
    createRole(input: IRole): Promise<any>
    editRole(id: string, input: IRole): Promise<IRole>
    deleteRole(id: string): Promise<any>
}

export type {IRoleProvider}
