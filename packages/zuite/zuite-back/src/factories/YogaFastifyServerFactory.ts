import YogaFastifyServer from "../servers/YogaFastifyServer.js";
import {jwtMiddleware, rbacMiddleware, apiKeyMiddleware, UserRoutes, RoleRoutes, TenantRoutes, UserApiKeyRoutes} from "@drax/identity-back"
import {MediaRoutes} from "@drax/media-back"
import {PersonFastifyRoutes} from "../modules/people/routes/PersonRoutes.js"
import {CountryFastifyRoutes} from "../modules/people/routes/CountryRoutes.js"
import {LanguageFastifyRoutes} from "../modules/people/routes/LanguageRoutes.js"
import ModuleMerger from "../merge/ModuleMerger.js";
import {DynamicFormRoutes} from "@drax/dynamic-back";
import {SettingRoutes} from "@drax/settings-back";
const {typeDefs, resolvers} = await ModuleMerger()

function YogaFastifyServerFactory(rootDir:string) {
    const server = new YogaFastifyServer(typeDefs, resolvers, rootDir);
    server.fastifyDecorateRequest('authUser',null)
    server.fastifyHook('onRequest',jwtMiddleware)
    server.fastifyHook('onRequest',apiKeyMiddleware)
    server.fastifyHook('onRequest',rbacMiddleware)
    server.fastifyRegister(UserRoutes)
    server.fastifyRegister(RoleRoutes)
    server.fastifyRegister(TenantRoutes)
    server.fastifyRegister(UserApiKeyRoutes)

    server.fastifyRegister(MediaRoutes)
    server.fastifyRegister(SettingRoutes)

    server.fastifyRegister(PersonFastifyRoutes)
    server.fastifyRegister(CountryFastifyRoutes)
    server.fastifyRegister(LanguageFastifyRoutes)

    server.fastifyRegister(DynamicFormRoutes)
    return server
}

export default YogaFastifyServerFactory
