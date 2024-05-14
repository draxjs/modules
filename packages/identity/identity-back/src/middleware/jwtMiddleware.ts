import AuthUtils from "../utils/AuthUtils.js";

interface AuthUser {
    id: string
    username: string;
}


function jwtMiddleware (request, reply, done) {
        try{
            const token = request.headers?.authorization?.replace(/Bearer /i, "")
            console.log("token",token)
            if(token){
                const authUser = AuthUtils.verifyToken(token) as AuthUser
                console.log("authUser",authUser)
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
export type {AuthUser}
