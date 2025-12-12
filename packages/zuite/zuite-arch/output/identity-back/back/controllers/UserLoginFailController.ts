
import UserLoginFailServiceFactory from "../factory/services/UserLoginFailServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import UserLoginFailPermissions from "../permissions/UserLoginFailPermissions.js";
import type {IUserLoginFail, IUserLoginFailBase} from "../interfaces/IUserLoginFail";

class UserLoginFailController extends AbstractFastifyController<IUserLoginFail, IUserLoginFailBase, IUserLoginFailBase>   {

    constructor() {
        super(UserLoginFailServiceFactory.instance, UserLoginFailPermissions)
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

export default UserLoginFailController;
export {
    UserLoginFailController
}

