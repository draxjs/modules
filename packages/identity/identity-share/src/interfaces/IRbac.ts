import type { IRole } from "./IRole";
import {IAuthUser} from "./IAuthUser";

interface IRbac {
    readonly getRole: IRole;
    readonly getAuthUser: IAuthUser;
    readonly userId: string;
    readonly username: string;
    readonly tenantId: string | undefined;
    readonly tenantName: string | undefined;
    readonly roleId: string | undefined;
    readonly roleName: string | undefined;
    readonly apiKeyId: string | undefined;
    readonly apiKeyName: string | undefined;
    readonly session: string | undefined;

    hasPermission(requiredPermission: string): boolean;
    hasSomePermission(requiredPermission: string[]): boolean;
    assertPermission(requiredPermission: string): void;
    assertOrPermissions(requiredPermissions: string[]): boolean;
    assertAuthenticated(): void;
    assertUserId(userId: string): void;
    assertTenantId(tenantId: string): void;
}

export default IRbac;
export { IRbac };
