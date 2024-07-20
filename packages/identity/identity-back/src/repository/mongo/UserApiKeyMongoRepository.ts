import {UserApiKeyModel} from "../../models/UserApiKeyModel.js";
import {
    mongoose,
    MongooseErrorToValidationError,
    MongoServerErrorToValidationError,
    ValidationError
} from "@drax/common-back"
import type {IUserApiKey, IUserApiKeyBase, IUserApiKeySoftDelete} from "@drax/identity-share";
import {DeleteResult, MongoServerError} from "mongodb";
import {PaginateResult} from "mongoose";
import {IDraxPaginateOptions, IDraxPaginateResult} from "@drax/common-share";
import {IUserApiKeyRepository} from "../../interfaces/IUserApiKeyRepository";

class UserMongoRepository implements IUserApiKeyRepository {


    constructor() {
    }

    async create(data: IUserApiKeyBase): Promise<IUserApiKey> {
        try {

            const userApiKey: mongoose.HydratedDocument<IUserApiKey> = new UserApiKeyModel(data)
            await userApiKey.save()
            await userApiKey.populate(['user', 'user.tenant'])
            return userApiKey
        } catch (e) {
            if (e instanceof mongoose.Error.ValidationError) {
                throw MongooseErrorToValidationError(e)
            }
            throw e
        }

    }

    async update(id: string, data: IUserApiKeyBase): Promise<IUserApiKey> {
        try {
            delete data.secret
            const userApiKey: mongoose.HydratedDocument<IUserApiKey> = await UserApiKeyModel.findOneAndUpdate({_id: id}, data, {new: true}).populate(['user', 'user.tenant']).exec()
            return userApiKey
        } catch (e) {
            if (e instanceof mongoose.Error.ValidationError) {
                throw MongooseErrorToValidationError(e)
            }
            if (e instanceof MongoServerError || e.name === 'MongoServerError') {
                throw MongoServerErrorToValidationError(e)
            }
            throw e
        }
    }

    async delete(id: string): Promise<boolean> {
        const userApiKey: mongoose.HydratedDocument<IUserApiKeySoftDelete> = await UserApiKeyModel.findById(id)
        userApiKey.softDelete()
        return true
    }

    async findById(id: string): Promise<IUserApiKey> {
        const userApiKey: mongoose.HydratedDocument<IUserApiKey> = await UserApiKeyModel.findById(id).populate(['user', 'user.tenant']).exec()
        return userApiKey
    }

    async findBySecret(secret: string): Promise<IUserApiKey> {
        const userApiKey: mongoose.HydratedDocument<IUserApiKey> = await UserApiKeyModel.findOne({secret: secret}).populate(['user', 'user.tenant']).exec()
        return userApiKey
    }

    async paginate({
                       page = 1,
                       limit = 5,
                       orderBy = '',
                       orderDesc = false,
                       search = '',
                       filters = []
                   }: IDraxPaginateOptions): Promise<IDraxPaginateResult<IUserApiKey>> {

        const query = {
            deleted: false
        }

        if (search) {
            query['$or'] = [
                {name: new RegExp(search, 'i')},
            ]
        }

        if (filters) {
            for (const filter of filters) {
                if (filter.operator === '$eq') {
                    query[filter.field] = {$eq: filter.value}
                }
                if (filter.operator === '$ne') {
                    query[filter.field] = {$ne: filter.value}
                }
                if (filter.operator === '$in') {
                    query[filter.field] = {$in: filter.value}
                }
            }
        }



        const options = {populate: ['user', 'user.tenant'], page: page, limit: limit}

        const userApiKeyPaginated: PaginateResult<IUserApiKey> = await UserApiKeyModel.paginate(query, options)
        return {
            page: page,
            limit: limit,
            total: userApiKeyPaginated.totalDocs,
            items: userApiKeyPaginated.docs
        }
    }

}

export default UserMongoRepository
