import {IAuthUser, IUserApiKey} from "@drax/identity-share";
import {DraxCache, DraxConfig} from "@drax/common-back";
import UserApiKeyServiceFactory from "../factory/UserApiKeyServiceFactory.js";
import IdentityConfig from "../config/IdentityConfig.js";

const verifyIp = DraxConfig.getOrLoad(IdentityConfig.VerifyIP, 'boolean', true);
const cacheTTL = DraxConfig.getOrLoad(IdentityConfig.ApiKeyCacheTTL, 'number',10000)

const draxCache = new DraxCache<IUserApiKey>(cacheTTL);


async function userApiKeyLoader(k): Promise<IUserApiKey | null> {
    const userApiKeyService = UserApiKeyServiceFactory()
    const userApiKey: IUserApiKey = await userApiKeyService.findBySecret(k)
    return userApiKey
}

async function apiKeyMiddleware(request, reply) {
    try {
        let apiKey: string

        //Por header 'x-api-key'
        if (request.headers['x-api-key']) {
            apiKey = request.headers['x-api-key']
        }

        //Por authorization 'ApiKey <uuid-key>'
        const apiKeyRegExp = /^ApiKey (.*)$/i;
        if (request.headers['authorization'] && apiKeyRegExp.test(request.headers['authorization'])) {
            apiKey = request.headers?.authorization?.replace(/ApiKey /i, "")
        }

        //Por authorization '<uuid-key>'
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (request.headers['authorization'] && uuidRegex.test(request.headers['authorization'])) {
            apiKey = request.headers['authorization']
        }

        if (apiKey) {
            const userApiKey: IUserApiKey = await draxCache.getOrLoad(apiKey, userApiKeyLoader)

            if (verifyIp) {
                if (userApiKey.ipv4 && userApiKey.ipv4.length > 0) {
                    const clientIp = request.ip
                    if (!userApiKey.ipv4.includes(clientIp)) {
                        reply.code(401).send({"statusCode": "401", error: 'IP not allowed', i18nMessage: 'error.ipNotAllowed', clientIp: clientIp, message: `Remote IP ${clientIp} is not allowed`});
                        return
                    }
                } else if (userApiKey.ipv6 && userApiKey.ipv6.length > 0) {
                    const clientIp = request.ip
                    if (!userApiKey.ipv6.includes(clientIp)) {
                        reply.code(401).send({"statusCode": "401", error: 'IP not allowed', i18nMessage: 'error.ipNotAllowed', clientIp: clientIp, message: `Remote IP ${clientIp} is not allowed`});
                        return
                    }
                }
            }


            if (userApiKey && userApiKey.user) {
                const authUser: IAuthUser = {
                    id: userApiKey.user._id.toString(),
                    username: userApiKey.user.username,
                    roleId: userApiKey.user.role?._id?.toString(),
                    roleName: userApiKey.user.role?.name,
                    tenantId: userApiKey.user?.tenant?._id?.toString(),
                    tenantName: userApiKey.user?.tenant?.name,
                    apiKeyId: userApiKey?._id?.toString(),
                    apiKeyName: userApiKey?.name
                }
                request.authUser = authUser
            }
        }
        return
    } catch (e) {
        console.error(e)
        reply.code(500).send({error: 'APIKEY ERROR'});
    }
}

export default apiKeyMiddleware;
export {apiKeyMiddleware}
