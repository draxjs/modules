import AuthUtils from "../utils/AuthUtils.js";
import {IJwtUser} from "@drax/identity-share";

function jwtMiddleware (request, reply, done) {
        try{

            let token: string

            const bearerRegExp = /^Bearer (.*)$/i;
            if(request.headers['authorization'] && bearerRegExp.test(request.headers['authorization'])){
                token = request.headers?.authorization?.replace(/Bearer /i, "")
            }

            if(token){
                const authUser = AuthUtils.verifyToken(token) as IJwtUser
                if(authUser){
                    request.authUser = authUser
                }
            }
            done()
        }catch (e) {
            console.error(e)
            reply.code(401).send({ error: 'Token JWT inválido' });
        }
}

export default jwtMiddleware;
export {jwtMiddleware}
