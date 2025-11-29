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

            if(routerPath != '/api/auth/login' && token){
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
