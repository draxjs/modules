
import UserSessionServiceFactory from "../factory/services/UserSessionServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import UserSessionPermissions from "../permissions/UserSessionPermissions.js";
import type {IUserSession, IUserSessionBase} from "../interfaces/IUserSession";

class UserSessionController extends AbstractFastifyController<IUserSession, IUserSessionBase, IUserSessionBase>   {

    constructor() {
        super(UserSessionServiceFactory.instance, UserSessionPermissions)
        this.tenantField = "tenant";
        this.userField = "user";
        this.tenantFilter = false;
        this.userFilter = true;
        this.tenantSetter = false;
        this.userSetter = true;
        this.tenantAssert = false;
        this.userAssert = true;
    }

}

export default UserSessionController;
export {
    UserSessionController
}

