import type {IJwtUser, IRole, IRbac} from "@drax/identity-share";
import {UnauthorizedError, ForbiddenError} from "@drax/common-back";
import {IAuthUser} from "@drax/identity-share/dist";

class Rbac implements IRbac{
    private role: IRole;
    private authUser: IAuthUser;

    constructor(authUser: IJwtUser, role: IRole) {
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
            roleId: this.roleId,
            tenantId: this.tenantId
        }
    }

    get username(): string{
        return this.authUser.username
    }

    get userId(): string  {
        return this.authUser?.id.toString()
    }

    get roleId(): string  {
        return this.authUser?.roleId.toString()
    }

    get tenantId(): string | undefined  {
        return this.authUser?.tenantId?.toString();
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
        if (!this.hasPermission(requiredPermission)) {
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
