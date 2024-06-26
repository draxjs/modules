import AuthUtils from "../utils/AuthUtils.js";
import {IJWTUser} from "@drax/identity-share";

function jwtMiddleware (request, reply, done) {
        try{
            const token = request.headers?.authorization?.replace(/Bearer /i, "")

            if(token){
                const authUser = AuthUtils.verifyToken(token) as IJWTUser
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
