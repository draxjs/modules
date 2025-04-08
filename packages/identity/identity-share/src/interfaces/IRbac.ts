import type { IRole } from "./IRole";
import {IAuthUser} from "./IAuthUser";

interface IRbac {
    readonly getRole: IRole;
    readonly getAuthUser: IAuthUser;
    readonly userId: string;
    readonly tenantId: string | undefined;

    hasPermission(requiredPermission: string): boolean;
    assertPermission(requiredPermission: string): void;
    assertOrPermissions(requiredPermissions: string[]): boolean;
    assertAuthenticated(): void;
    assertUserId(userId: string): void;
    assertTenantId(tenantId: string): void;
}

export default IRbac;
export { IRbac };
