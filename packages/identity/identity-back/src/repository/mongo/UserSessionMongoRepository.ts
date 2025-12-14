
import {AbstractMongoRepository} from "@drax/crud-back";
import {UserSessionModel} from "../../models/UserSessionModel.js";
import type {IUserSessionRepository} from '../../interfaces/IUserSessionRepository'
import type {IUserSession, IUserSessionBase} from "@drax/identity-share";


class UserSessionMongoRepository extends AbstractMongoRepository<IUserSession, IUserSessionBase, IUserSessionBase> implements IUserSessionRepository {

    constructor() {
        super();
        this._model = UserSessionModel;
        this._searchFields = ['uuid', 'userAgent', 'ip'];
         this._populateFields = ['user'];
    }

}

export default UserSessionMongoRepository
export {UserSessionMongoRepository}

