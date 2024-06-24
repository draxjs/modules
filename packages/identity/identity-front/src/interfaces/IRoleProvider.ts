import type {IRole, IRoleBase} from "./IRole";
import type {IPaginateClient} from "@drax/common-front";

interface IRoleProvider {
    fetchRole(): Promise<IRole[]>
    fetchPermissions(): Promise<any>
    paginateRole(page: number, limit: number, search:string): Promise<IPaginateClient<IRole>>
    createRole(input: IRoleBase): Promise<IRole>
    editRole(id: string, input: IRoleBase): Promise<IRole>
    deleteRole(id: string): Promise<any>
}

export type {IRoleProvider}
