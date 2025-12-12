
import {AbstractMongoRepository} from "@drax/crud-back";
import {UserSessionModel} from "../models/UserSessionModel.js";
import type {IUserSessionRepository} from '../interfaces/IUserSessionRepository'
import type {IUserSession, IUserSessionBase} from "../interfaces/IUserSession";


class UserSessionMongoRepository extends AbstractMongoRepository<IUserSession, IUserSessionBase, IUserSessionBase> implements IUserSessionRepository {

    constructor() {
        super();
        this._model = UserSessionModel;
        this._searchFields = ['uuid', 'agent', 'ip'];
         this._populateFields = ['user'];
    }

}

export default UserSessionMongoRepository
export {UserSessionMongoRepository}

