import {IUserApiKey, IUserApiKeyBase} from '@drax/identity-share'
import {IDraxCrud} from "@drax/crud-share";

interface IUserApiKeyRepository extends IDraxCrud<IUserApiKey, IUserApiKeyBase, IUserApiKeyBase>{
    findBySecret(username: string): Promise<IUserApiKey | null>;
}

export {IUserApiKeyRepository}
