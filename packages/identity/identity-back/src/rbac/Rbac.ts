import {IRoleBase} from "../interfaces/IRole";
import {IJwtUser} from "identity";
import UnauthorizedError from "../errors/UnauthorizedError.js";

class Rbac{
    private role: IRoleBase;
    private authUser: IJwtUser;

    constructor(authUser: IJwtUser, role: IRoleBase) {
        this.authUser = authUser;
        this.role = role;
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
