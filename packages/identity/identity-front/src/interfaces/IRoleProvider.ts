import type {IRole} from "@/interfaces/IRole";


interface IRoleProvider {
    fetchRole(): Promise<any>
    createRole(input: IRole): Promise<any>
}

export type {IRoleProvider}
