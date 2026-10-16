import AuthUtils from "../utils/AuthUtils.js";
import {IAuthUser} from "@drax/identity-share";

function jwtMiddleware (request, reply, done) {
        try{

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
                reply.code(498).send({ error: 'JWT expirado' });
            }
            reply.code(401).send({ error: 'Token JWT inválido' });
        }
}

export default jwtMiddleware;
export {jwtMiddleware}
