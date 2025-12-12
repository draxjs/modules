
import type{IUserLoginFailRepository} from "../interfaces/IUserLoginFailRepository";
import type {IUserLoginFailBase, IUserLoginFail} from "../interfaces/IUserLoginFail";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class UserLoginFailService extends AbstractService<IUserLoginFail, IUserLoginFailBase, IUserLoginFailBase> {

    constructor(UserLoginFailRepository: IUserLoginFailRepository, schema?: ZodObject<ZodRawShape>) {
        super(UserLoginFailRepository, schema);
    }

}

export default UserLoginFailService
export {UserLoginFailService}
