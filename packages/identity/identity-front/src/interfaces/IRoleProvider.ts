import type {IRole, IRoleBase} from "@drax/identity-share";
import type {IDraxCrud} from "@drax/crud-share";

interface IRoleProvider extends IDraxCrud<IRole, IRoleBase, IRoleBase>{
    fetchRole(): Promise<IRole[]>
    fetchPermissions(): Promise<any>
}

export type {IRoleProvider}
