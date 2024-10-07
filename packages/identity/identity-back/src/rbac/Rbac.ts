import {IJwtUser, IRole} from "@drax/identity-share";
import {UnauthorizedError} from "@drax/common-back";

class Rbac {
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

    hasPermission(requiredPermission: string): boolean {
        if (!this.authUser || !this.role || !this.role.permissions || this.role.permissions.length === 0) {
            return false;
        }

        return this.role.permissions.includes(requiredPermission);
    }

    assertPermission(requiredPermission: string) {
        if (!this.hasPermission(requiredPermission)) {
            throw new UnauthorizedError()
        }
    }

    assertOrPermissions(requiredPermissions: string[]) {

        for(let requiredPermission of requiredPermissions){
            if (this.hasPermission(requiredPermission)) {
                return true
            }
        }

        throw new UnauthorizedError()
    }

    assertAuthenticated() {
        if (!this.authUser) {
            throw new UnauthorizedError()
        }
    }

}

export default Rbac;
export {Rbac}
