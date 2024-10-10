import type {IRole, IRoleBase} from "@drax/identity-share";
import type {IDraxCrudProvider} from "@drax/crud-share";

interface IRoleProvider extends IDraxCrudProvider<IRole, IRoleBase, IRoleBase>{
    fetchRole(): Promise<IRole[]>
    fetchPermissions(): Promise<any>
}

export type {IRoleProvider}
