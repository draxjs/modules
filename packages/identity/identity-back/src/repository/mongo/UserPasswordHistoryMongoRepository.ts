import {AbstractMongoRepository} from "@drax/crud-back";
import type {IUserPasswordHistoryRepository} from "../../interfaces/IUserPasswordHistoryRepository.js";
import type {IUserPasswordHistory, IUserPasswordHistoryCreate} from "../../interfaces/IUserPasswordHistory.js";
import {UserPasswordHistoryModel} from "../../models/UserPasswordHistoryModel.js";

class UserPasswordHistoryMongoRepository extends AbstractMongoRepository<IUserPasswordHistory, IUserPasswordHistoryCreate, IUserPasswordHistoryCreate> implements IUserPasswordHistoryRepository {
    constructor() {
        super();
        this._model = UserPasswordHistoryModel;
        this._searchFields = ["user"];
        this._populateFields = ["user"];
    }

    async findLatestByUserId(userId: string, limit: number): Promise<IUserPasswordHistory[]> {
        return UserPasswordHistoryModel
            .find({user: userId})
            .sort({createdAt: -1})
            .limit(limit)
            .lean(true)
            .exec() as Promise<IUserPasswordHistory[]>
    }
}

export default UserPasswordHistoryMongoRepository
export {UserPasswordHistoryMongoRepository}
