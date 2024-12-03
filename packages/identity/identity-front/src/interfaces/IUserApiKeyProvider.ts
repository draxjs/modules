import type {IUserApiKey, IUserApiKeyBase} from "@drax/identity-share";
import type {IDraxCrudProvider} from "@drax/crud-share";

interface IUserApiKeyProvider extends IDraxCrudProvider<IUserApiKey, IUserApiKeyBase, IUserApiKeyBase> {
}

export type {IUserApiKeyProvider}
