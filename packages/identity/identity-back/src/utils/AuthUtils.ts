import bcryptjs from "bcryptjs";
import jsonwebtoken, {SignOptions, VerifyOptions} from "jsonwebtoken";

class AuthUtils{

    static verifyToken(token : string) {
        const JWT_SECRET = process.env.JWT_SECRET
        if(!JWT_SECRET){
            throw new Error("JWT_SECRET ENV must be provided")
        }
        const options : VerifyOptions = {
            algorithms: ['HS256'],
        }
        return jsonwebtoken.verify(token, JWT_SECRET, options)
    }

    static hashPassword(password : string) :string {
        if (!password) {
            throw new Error("password must be provided")
        }

        let salt = bcryptjs.genSaltSync(10);
        let hashPassword = bcryptjs.hashSync(password, salt);
        return hashPassword;
    }

    static checkPassword(password : string, hashPassword : string) {
        return bcryptjs.compareSync(password, hashPassword);
    }

    static tokenSignPayload(userId : string, username: string, roleId: string, session : string) {
        return {
            id: userId,
            username: username,
            roleId: roleId,
            session: session
        };
    }

    static generateToken(userId : string, username: string, roleId: string,  session : string) {
        const payload = AuthUtils.tokenSignPayload(userId, username, roleId, session)

        const JWT_SECRET = process.env.JWT_SECRET
        if(!JWT_SECRET){
            throw new Error("JWT_SECRET ENV must be provided")
        }

        const options : SignOptions = {
            expiresIn: process.env.JWT_EXPIRATION || '1h',
            jwtid: userId,
            algorithm: 'HS256',
            audience: username,
            issuer: process.env.JWT_ISSUER? process.env.JWT_ISSUER : 'drax'
        }

        let token = jsonwebtoken.sign(
            payload,
            JWT_SECRET,
            options
        )

        return token
    }
}

export default AuthUtils
