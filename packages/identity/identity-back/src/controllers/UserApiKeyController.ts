import type {IUserApiKey, IUserApiKeyBase} from "@drax/identity-share";
import {AbstractFastifyController, CustomRequest} from "@drax/crud-back";

import UserApiKeyServiceFactory from "../factory/UserApiKeyServiceFactory.js";
import UserApiKeyService from "../services/UserApiKeyService.js";
import UserApiKeyPermissions from "../permissions/UserApiKeyPermissions.js";

type UserApiKeyPayload = IUserApiKeyBase & {
    user?: string
}

class UserApiKeyController extends AbstractFastifyController<IUserApiKey, UserApiKeyPayload, UserApiKeyPayload> {

    protected service: UserApiKeyService

    protected userField: string = 'user'
    protected userFilter: boolean = true
    protected userSetter: boolean = true
    protected userAssert: boolean = true

    constructor() {
        super(UserApiKeyServiceFactory(), UserApiKeyPermissions)
    }

    async preCreate(request: CustomRequest, payload: UserApiKeyPayload): Promise<UserApiKeyPayload> {
        request.rbac.assertAuthenticated()
        payload.createdBy = request.rbac.userId
        return payload
    }
}

export default UserApiKeyController;
export {
    UserApiKeyController
}
