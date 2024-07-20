import {IUserApiKeyRepository} from "../interfaces/IUserApiKeyRepository";
import {DraxConfig, ValidationError, ZodErrorToValidationError} from "@drax/common-back"
import {userApiKeySchema} from "../zod/UserApiKeyZod.js";
import {ZodError} from "zod";
import {IUserApiKeyBase, IUserApiKey} from "@drax/identity-share";
import {IDraxPaginateOptions, IDraxPaginateResult} from "@drax/common-share";
import crypto from "node:crypto";
import AuthUtils from "../utils/AuthUtils.js";
import IdentityConfig from "../config/IdentityConfig.js";

class UserApiKeyService {

    _repository: IUserApiKeyRepository

    constructor(userApiKeyRepostitory: IUserApiKeyRepository) {
        this._repository = userApiKeyRepostitory
        console.log("UserApiKeyService constructor")
    }

    async create(userApiKeyData: IUserApiKeyBase): Promise<IUserApiKey> {
        try {
            userApiKeyData.name = userApiKeyData?.name?.trim()
            const secret = crypto.randomUUID()
            const APIKEY_SECRET = DraxConfig.getOrLoad(IdentityConfig.ApiKeySecret)
            userApiKeyData.secret = AuthUtils.generateHMAC(APIKEY_SECRET, secret)
            await userApiKeySchema.parseAsync(userApiKeyData)
            const userApiKey = await this._repository.create(userApiKeyData)
            userApiKey.secret = secret
            return userApiKey
        } catch (e) {
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
            await userApiKeySchema.parseAsync(userApiKeyData)
            const userApiKey = await this._repository.update(id, userApiKeyData)
            return userApiKey
        } catch (e) {
            if (e instanceof ZodError) {
                throw ZodErrorToValidationError(e, userApiKeyData)
            }
            throw e
        }
    }

    async delete(id: string): Promise<boolean> {
        const currentUserApiKey = await this.findById(id)
        const deletedUserApiKey = await this._repository.delete(id);
        return deletedUserApiKey;
    }

    async findById(id: string): Promise<IUserApiKey | null> {
        const userApiKey: IUserApiKey = await this._repository.findById(id);
        return userApiKey
    }

    async findBySecret(secret: string): Promise<IUserApiKey | null> {
        const APIKEY_SECRET = DraxConfig.getOrLoad(IdentityConfig.ApiKeySecret)
        const hashedSecret = AuthUtils.generateHMAC(APIKEY_SECRET, secret)
        const userApiKey: IUserApiKey = await this._repository.findBySecret(hashedSecret);
        return userApiKey
    }


    async paginate({
                       page= 1,
                       limit= 5,
                       orderBy= '',
                       orderDesc= false,
                       search= '',
                       filters= []} : IDraxPaginateOptions): Promise<IDraxPaginateResult<IUserApiKey>>{
        const pagination = await this._repository.paginate({page, limit, orderBy, orderDesc, search, filters});
        return pagination;
    }


}

export default UserApiKeyService
