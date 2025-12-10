import {IUserApiKeyRepository} from "../interfaces/IUserApiKeyRepository";
import {DraxConfig, ValidationError, ZodErrorToValidationError} from "@drax/common-back"
import {UserApiKeyBaseSchema} from "../schemas/UserApiKeySchema.js";
import {ZodError} from "zod";
import {IUserApiKeyBase, IUserApiKey} from "@drax/identity-share";
import {IDraxPaginateOptions, IDraxPaginateResult} from "@drax/crud-share";
import crypto from "node:crypto";
import AuthUtils from "../utils/AuthUtils.js";
import IdentityConfig from "../config/IdentityConfig.js";
import {AbstractService} from "@drax/crud-back";

class UserApiKeyService extends AbstractService<IUserApiKey, IUserApiKeyBase, IUserApiKeyBase>{

    _repository: IUserApiKeyRepository

    constructor(userApiKeyRepostitory: IUserApiKeyRepository) {
        super(userApiKeyRepostitory,UserApiKeyBaseSchema)
        this._repository = userApiKeyRepostitory
    }

    async create(userApiKeyData: IUserApiKeyBase): Promise<IUserApiKey> {
        try {
            userApiKeyData.name = userApiKeyData?.name?.trim()
            const secret = crypto.randomUUID()
            const APIKEY_SECRET = DraxConfig.getOrLoad(IdentityConfig.ApiKeySecret)
            if(!APIKEY_SECRET){
                throw new Error('ApiKey miss configuration')
            }
            userApiKeyData.secret = AuthUtils.generateHMAC(APIKEY_SECRET, secret)
            await UserApiKeyBaseSchema.parseAsync(userApiKeyData)
            const userApiKey = await this._repository.create(userApiKeyData)
            userApiKey.secret = secret
            return userApiKey
        } catch (e) {
            console.error("Error creating userApiKey", e)
            if (e instanceof ZodError) {
                throw ZodErrorToValidationError(e, userApiKeyData)
            }
            throw e
        }
    }

    async update(id: string, userApiKeyData: IUserApiKeyBase) {
        try {
            userApiKeyData.name = userApiKeyData?.name?.trim()
            delete userApiKeyData.secret
            await UserApiKeyBaseSchema.parseAsync(userApiKeyData)
            const userApiKey = await this._repository.update(id, userApiKeyData)
            return userApiKey
        } catch (e) {
            console.error("Error updating userApiKey", e)
            if (e instanceof ZodError) {
                throw ZodErrorToValidationError(e, userApiKeyData)
            }
            throw e
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            const deletedUserApiKey = await this._repository.delete(id);
            return deletedUserApiKey;
        } catch (e) {
            console.error("Error deleting userApiKey", e)
            throw e
        }

    }

    async findById(id: string): Promise<IUserApiKey | null> {
        try{
            const userApiKey: IUserApiKey = await this._repository.findById(id);
            return userApiKey
        }catch (e){
            console.error("Error finding userApiKey by id", e)
            throw e
        }

    }



    async findBySecret(secret: string): Promise<IUserApiKey | null> {
        try{
            const APIKEY_SECRET = DraxConfig.getOrLoad(IdentityConfig.ApiKeySecret)
            if(!APIKEY_SECRET){
                throw new Error('ApiKey miss configuration')
            }
            const hashedSecret = AuthUtils.generateHMAC(APIKEY_SECRET, secret)
            const userApiKey: IUserApiKey = await this._repository.findBySecret(hashedSecret);
            return userApiKey
        }catch (e){
            console.error("Error finding userApiKey by secret", e)
            throw e
        }

    }


    async paginate({
                       page = 1,
                       limit = 5,
                       orderBy = '',
                       order = "asc",
                       search = '',
                       filters = []
                   }: IDraxPaginateOptions): Promise<IDraxPaginateResult<IUserApiKey>> {
        try {
            const pagination = await this._repository.paginate({page, limit, orderBy, order, search, filters});
            return pagination;
        } catch (e) {
            console.error("Error paginating userApiKeys", e)
            throw e
        }
    }


}

export default UserApiKeyService
