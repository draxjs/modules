import type {IJwtUser, IRole, IRbac} from "@drax/identity-share";
import {UnauthorizedError, ForbiddenError} from "@drax/common-back";

class Rbac implements IRbac{
    private role: IRole;
    private authUser: IJwtUser;

    constructor(authUser: IJwtUser, role: IRole) {
        this.authUser = authUser;
        this.role = role;
    }

    get getRole() {
        return this.role
    }

    get getAuthUser() {
        return this.authUser
    }

    get userId(){
        return this.authUser.id
    }

    get tenantId(){
        return this.authUser.tenantId
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
        if (this.userId != userId) {
            throw new UnauthorizedError()
        }
    }

    assertTenantId(tenantId: string) {
        if (this.tenantId && this.tenantId != tenantId) {
            throw new UnauthorizedError()
        }
    }

}

export default Rbac;
export {Rbac}
