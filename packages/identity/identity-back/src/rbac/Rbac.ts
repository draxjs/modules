import {IJWTUser, IRole} from "@drax/identity-share";
import UnauthorizedError from "../errors/UnauthorizedError.js";

class Rbac{
    private role: IRole;
    private authUser: IJWTUser;

    constructor(authUser: IJWTUser, role: IRole) {
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
        if(!this.hasPermission(requiredPermission)){
            throw new UnauthorizedError()
        }
    }

}

export default Rbac;
export {Rbac}
