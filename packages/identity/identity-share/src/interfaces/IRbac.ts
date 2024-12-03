import type { IJwtUser } from "./IJwtUser";
import type { IRole } from "./IRole";

interface IRbac {
    readonly getRole: IRole;
    readonly getAuthUser: IJwtUser;
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
