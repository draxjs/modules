
import {AbstractMongoRepository} from "@drax/crud-back";
import {UserLoginFailModel} from "../models/UserLoginFailModel.js";
import type {IUserLoginFailRepository} from '../interfaces/IUserLoginFailRepository'
import type {IUserLoginFail, IUserLoginFailBase} from "../interfaces/IUserLoginFail";


class UserLoginFailMongoRepository extends AbstractMongoRepository<IUserLoginFail, IUserLoginFailBase, IUserLoginFailBase> implements IUserLoginFailRepository {

    constructor() {
        super();
        this._model = UserLoginFailModel;
        this._searchFields = ['agent', 'ip'];
         this._populateFields = ['user'];
    }

}

export default UserLoginFailMongoRepository
export {UserLoginFailMongoRepository}

