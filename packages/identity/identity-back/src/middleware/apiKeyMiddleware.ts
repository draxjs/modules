import {IUserApiKey} from "@drax/identity-share";
import {DraxCache, DraxConfig} from "@drax/common-back";
import UserApiKeyServiceFactory from "../factory/UserApiKeyServiceFactory.js";
import IdentityConfig from "../config/IdentityConfig.js";

const cacheTTL = DraxConfig.getOrLoad(IdentityConfig.ApiKeyCacheTTL) ? parseInt(DraxConfig.getOrLoad(IdentityConfig.ApiKeyCacheTTL)) : 10000;
const draxCache = new DraxCache<IUserApiKey>(cacheTTL);


async function userApiKeyLoader(k):Promise<IUserApiKey | null> {
    const userApiKeyService = UserApiKeyServiceFactory()
    const userApiKey: IUserApiKey = await userApiKeyService.findBySecret(k)
    return userApiKey
}

async function apiKeyMiddleware (request, reply) {
        try{
            let apiKey: string

            if(request.headers['x-api-key']){
                apiKey = request.headers['x-api-key']
            }

            const apiKeyRegExp = /^ApiKey (.*)$/i;
            if(request.headers['authorization'] && apiKeyRegExp.test(request.headers['authorization'])){
                apiKey = request.headers?.authorization?.replace(/ApiKey /i, "")
            }

            if(apiKey){
                const userApiKey = await draxCache.getOrLoad(apiKey, userApiKeyLoader)
                if(userApiKey && userApiKey.user){
                    request.authUser = userApiKey.user
                    request.authUser.roleId = userApiKey.user.role.id
                    request.authUser.tenantId = userApiKey.user?.tenant?.id
                }
            }
            return
        }catch (e) {
            console.error(e)
            reply.code(500).send({ error: 'APIKEY ERROR' });
        }
}

export default apiKeyMiddleware;
export {apiKeyMiddleware}
