
import {IUserSession, IUserSessionBase} from '@drax/identity-share'
import {IDraxCrudRepository} from "@drax/crud-share";

interface IUserSessionRepository extends IDraxCrudRepository<IUserSession, IUserSessionBase, IUserSessionBase>{

}

export {IUserSessionRepository}


