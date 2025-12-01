import type { IAuthUser, IRole, IRbac} from "@drax/identity-share";
import {UnauthorizedError, ForbiddenError} from "@drax/common-back";

class Rbac implements IRbac{
    private role: IRole;
    private authUser: IAuthUser;

    constructor(authUser: IAuthUser, role: IRole) {
        this.authUser = authUser;
        this.role = role;
    }

    get getRole(): IRole {
        return this.role
    }

    get getAuthUser():IAuthUser {
        return {
            id: this.userId,
            username: this.username,
            session: this.session,
            roleId: this.roleId,
            roleName: this.roleName,
            tenantId: this.tenantId,
            tenantName: this.tenantName,
            apiKeyId: this.apiKeyId,
            apiKeyName: this.apiKeyName
        }
    }

    get username(): string{
        return this.authUser.username
    }

    get userId(): string  {
        return this.authUser?.id.toString()
    }

    get session(): string  {
        return this.authUser?.session
    }

    get apiKeyId(): string  {
        return this.authUser?.apiKeyId.toString()
    }

    get apiKeyName(): string  {
        return this.authUser?.apiKeyName
    }

    get roleId(): string  {
        return this.authUser?.roleId?.toString()
    }

    get roleName(): string  {
        return this.authUser?.roleName
    }

    get tenantId(): string | undefined  {
        return this.authUser?.tenantId?.toString();
    }

    get tenantName(): string | undefined  {
        return this.authUser?.tenantName  ?? undefined;
    }

    assertAuthenticated() {
        if (!this.authUser) {
            throw new UnauthorizedError()
        }
    }

    hasPermission(requiredPermission: string): boolean {
        if (!this.authUser || !this.role || !this.role.permissions || this.role.permissions.length === 0) {
            return false;
        }

        return this.role.permissions.includes(requiredPermission);
    }

    hasSomePermission(requiredPermissions: string[]): boolean {
        if (!this.authUser || !this.role || !this.role.permissions || this.role.permissions.length === 0) {
            return false;
        }
        return this.role.permissions.some(permission => requiredPermissions.includes(permission));
    }

    assertPermission(requiredPermission: string) {
        this.assertAuthenticated()
        if (requiredPermission === undefined || !this.hasPermission(requiredPermission)) {
            throw new ForbiddenError()
        }
    }

    assertOrPermissions(requiredPermissions: string[]) {
        this.assertAuthenticated()
        for(let requiredPermission of requiredPermissions){
            if (this.hasPermission(requiredPermission)) {
                return true
            }
        }

        throw new ForbiddenError()
    }



    assertUserId(userId: string) {

        if(userId && typeof userId != 'string'){
            throw new Error('Rbac Error: userId must be a string')
        }

        if (this.userId != userId) {
            throw new UnauthorizedError()
        }
    }

    assertTenantId(tenantId: string) {

        if(tenantId && typeof tenantId != 'string'){
            throw new Error('Rbac Error: tenantId must be a string or null|undefined')
        }

        if (this.tenantId && this.tenantId != tenantId) {
            throw new UnauthorizedError()
        }

    }

}

export default Rbac;
export {Rbac}
