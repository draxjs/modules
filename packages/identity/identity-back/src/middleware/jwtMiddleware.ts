import AuthUtils from "../utils/AuthUtils.js";
import {IAuthUser} from "@drax/identity-share";

declare module 'fastify' {
    interface FastifyContextConfig {
        /** optional (default): validate a supplied Drax Bearer; ignore: leave it to the route. */
        identityJwt?: 'optional' | 'ignore';
    }
}

function jwtMiddleware (request, reply, done) {
        try{
            if (request.routeOptions?.config?.identityJwt === 'ignore') {
                done()
                return
            }

            let token: string

            const bearerRegExp = /^Bearer (.*)$/i;
            if(request.headers['authorization'] && bearerRegExp.test(request.headers['authorization'])){
                token = request.headers?.authorization?.replace(/Bearer /i, "")
            }

            const routerPath = request.url

            const publicAuthPaths = ['/api/auth/login', '/api/auth/refresh', '/api/auth/logout'];
            if(!publicAuthPaths.includes(routerPath.split('?')[0]) && token){
                const authUser: IAuthUser = AuthUtils.verifyToken(token)
                if(authUser){
                    request.authUser = authUser
                    request.token = token
                }
            }
            done()
        }catch (e) {
            console.error(e)
            if (e.name === 'TokenExpiredError') {
                return reply.code(498).send({ error: 'JWT expirado' });
            }
            return reply.code(401).send({ error: 'Token JWT inválido' });
        }
}

export default jwtMiddleware;
export {jwtMiddleware}
