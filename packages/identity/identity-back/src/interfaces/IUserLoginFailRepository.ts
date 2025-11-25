
import {IUserLoginFail, IUserLoginFailBase} from '@drax/identity-share'
import {IDraxCrudRepository} from "@drax/crud-share";

interface IUserLoginFailRepository extends IDraxCrudRepository<IUserLoginFail, IUserLoginFailBase, IUserLoginFailBase>{

}

export {IUserLoginFailRepository}


