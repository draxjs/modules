
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {IUserLoginFail, IUserLoginFailBase} from '../interfaces/IUserLoginFail'

class UserLoginFailProvider extends AbstractCrudRestProvider<IUserLoginFail, IUserLoginFailBase, IUserLoginFailBase> {
    
  static singleton: UserLoginFailProvider
    
  constructor() {
   super('/api/user-login-fails')
  }
  
  static get instance() {
    if(!UserLoginFailProvider.singleton){
      UserLoginFailProvider.singleton = new UserLoginFailProvider()
    }
    return UserLoginFailProvider.singleton
  }

}

export default UserLoginFailProvider

