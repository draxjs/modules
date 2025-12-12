
import type {IUserSession, IUserSessionBase} from './IUserSession'
import {IDraxCrudRepository} from "@drax/crud-share";

interface IUserSessionRepository extends IDraxCrudRepository<IUserSession, IUserSessionBase, IUserSessionBase>{

}

export {IUserSessionRepository}


