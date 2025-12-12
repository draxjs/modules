
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {IUserSession, IUserSessionBase} from '../interfaces/IUserSession'

class UserSessionProvider extends AbstractCrudRestProvider<IUserSession, IUserSessionBase, IUserSessionBase> {
    
  static singleton: UserSessionProvider
    
  constructor() {
   super('/api/user-sessions')
  }
  
  static get instance() {
    if(!UserSessionProvider.singleton){
      UserSessionProvider.singleton = new UserSessionProvider()
    }
    return UserSessionProvider.singleton
  }

}

export default UserSessionProvider

