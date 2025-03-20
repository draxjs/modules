import {IUserApiKey, IUserApiKeyBase} from '@drax/identity-share'
import {IDraxCrudRepository} from "@drax/crud-share";

interface IUserApiKeyRepository extends IDraxCrudRepository<IUserApiKey, IUserApiKeyBase, IUserApiKeyBase>{
    findBySecret(username: string): Promise<IUserApiKey | null>;
}

export {IUserApiKeyRepository}
