import FastifyServer from "../servers/FastifyServer.js";
import {
    jwtMiddleware,
    rbacMiddleware,
    apiKeyMiddleware,
    UserRoutes,
    RoleRoutes,
    TenantRoutes,
    UserApiKeyRoutes,
    UserLoginFailRoutes, UserSessionRoutes
} from "@drax/identity-back"
import {MediaRoutes} from "@drax/media-back"
import {PersonFastifyRoutes} from "../modules/people/routes/PersonRoutes.js"
import {CountryFastifyRoutes} from "../modules/people/routes/CountryRoutes.js"
import {LanguageFastifyRoutes} from "../modules/people/routes/LanguageRoutes.js"
import ModuleMerger from "../merge/ModuleMerger.js";
import {DynamicFormRoutes} from "@drax/dynamic-back";
import {DashboardRoutes} from "@drax/dashboard-back";
import {AuditRoutes} from "@drax/audit-back";
import {SettingRoutes} from "@drax/settings-back";

function FastifyServerFactory(rootDir:string) {
    const server = new FastifyServer(rootDir);
    server.fastifyDecorateRequest('authUser',null)
    server.fastifyHook('onRequest',jwtMiddleware)
    server.fastifyHook('onRequest',apiKeyMiddleware)
    server.fastifyHook('onRequest',rbacMiddleware)


    server.fastifyRegister(UserRoutes)
    server.fastifyRegister(RoleRoutes)
    server.fastifyRegister(TenantRoutes)
    server.fastifyRegister(UserApiKeyRoutes)
    server.fastifyRegister(UserLoginFailRoutes)
    server.fastifyRegister(UserSessionRoutes)

    server.fastifyRegister(MediaRoutes)
    server.fastifyRegister(SettingRoutes)

    server.fastifyRegister(PersonFastifyRoutes)
    server.fastifyRegister(CountryFastifyRoutes)
    server.fastifyRegister(LanguageFastifyRoutes)

    server.fastifyRegister(DynamicFormRoutes)
    server.fastifyRegister(DashboardRoutes)
    server.fastifyRegister(AuditRoutes)
    return server
}

export default FastifyServerFactory
