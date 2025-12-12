
import type{IUserSessionRepository} from "../interfaces/IUserSessionRepository";
import type {IUserSessionBase, IUserSession} from "../interfaces/IUserSession";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class UserSessionService extends AbstractService<IUserSession, IUserSessionBase, IUserSessionBase> {

    constructor(UserSessionRepository: IUserSessionRepository, schema?: ZodObject<ZodRawShape>) {
        super(UserSessionRepository, schema);
    }

}

export default UserSessionService
export {UserSessionService}
