import type {IUserApiKey, IUserApiKeyBase} from "@drax/identity-share";
import type {IDraxCrud} from "@drax/crud-share";

interface IUserApiKeyProvider extends IDraxCrud<IUserApiKey, IUserApiKeyBase, IUserApiKeyBase> {
    //findBySecret(): Promise<IUserApiKey[]>
}

export type {IUserApiKeyProvider}
