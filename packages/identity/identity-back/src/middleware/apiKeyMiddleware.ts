import {IAuthUser, IUserApiKey} from "@drax/identity-share";
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

            //Por header 'x-api-key'
            if(request.headers['x-api-key']){
                apiKey = request.headers['x-api-key']
            }

            //Por authorization 'ApiKey <uuid-key>'
            const apiKeyRegExp = /^ApiKey (.*)$/i;
            if(request.headers['authorization'] && apiKeyRegExp.test(request.headers['authorization'])){
                apiKey = request.headers?.authorization?.replace(/ApiKey /i, "")
            }

            //Por authorization '<uuid-key>'
            const uuidRegex = /^[0-9a-fA-F]{24}$/i;
            if(request.headers['authorization'] && uuidRegex.test(request.headers['authorization'])){
                apiKey = request.headers['authorization']
            }

            if(apiKey){
                const userApiKey = await draxCache.getOrLoad(apiKey, userApiKeyLoader)
                if(userApiKey && userApiKey.user){
                    const authUser: IAuthUser = {
                        id: userApiKey.user._id.toString(),
                        username: userApiKey.user.username,
                        roleId:  userApiKey.user.role?._id?.toString(),
                        tenantId: userApiKey.user?.tenant?._id?.toString(),
                    }
                    request.authUser = authUser
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
