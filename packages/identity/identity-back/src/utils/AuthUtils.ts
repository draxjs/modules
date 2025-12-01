import bcryptjs from "bcryptjs";
import jsonwebtoken, {SignOptions, VerifyOptions} from "jsonwebtoken";
import {DraxConfig} from "@drax/common-back";
import IdentityConfig from "../config/IdentityConfig.js";
import crypto from "crypto";
import type {IAuthUser} from "@drax/identity-share";
import {TokenPayloadSchema} from "../schemas/TokenPayloadSchema.js";


class AuthUtils{

    static verifyToken(token : string): IAuthUser {
        const JWT_SECRET = DraxConfig.getOrLoad(IdentityConfig.JwtSecret)
        if(!JWT_SECRET){
            throw new Error("DraxConfig.JWT_SECRET must be provided")
        }
        const options : VerifyOptions = {
            algorithms: ['HS256'],
        }
        const tokenPayload =  jsonwebtoken.verify(token, JWT_SECRET, options)
        TokenPayloadSchema.parse(tokenPayload)
        return tokenPayload as IAuthUser;
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


    static generateToken(payload: IAuthUser) {

        TokenPayloadSchema.parse(payload)

        const JWT_SECRET = DraxConfig.getOrLoad(IdentityConfig.JwtSecret)
        if(!JWT_SECRET){
            throw new Error("JWT_SECRET ENV must be provided")
        }

        const JWT_EXPIRATION = DraxConfig.getOrLoad(IdentityConfig.JwtExpiration) || '1h'
        const JWT_ISSUER = DraxConfig.getOrLoad(IdentityConfig.JwtIssuer) || 'DRAX'

        const options : SignOptions = {
            expiresIn: JWT_EXPIRATION,
            jwtid: payload.id,
            algorithm: 'HS256',
            audience: payload.username,
            issuer: JWT_ISSUER
        }

        let token = jsonwebtoken.sign(
            payload,
            JWT_SECRET,
            options
        )

        return token
    }

    static generateHMAC(secret: string, apikey: string) {
        // Crear un objeto HMAC utilizando el algoritmo SHA-256 y el secreto
        const hmac = crypto.createHmac('sha256', secret);
        // Actualizar el HMAC con la apikey
        hmac.update(apikey);
        // Generar el hash en formato hexadecimal
        return hmac.digest('hex');
    }

     static switchTenant(accessToken: string, newTenantId: string, tenantName: string): string {
        // Verificar que el token actual sea válido
        const tokenPayload = AuthUtils.verifyToken(accessToken) as IAuthUser & { exp?: number };

        if (!tokenPayload) {
            throw new Error("Invalid access token");
        }

        tokenPayload.tenantId = newTenantId;
        tokenPayload.tenantName = tenantName;


        const JWT_SECRET = DraxConfig.getOrLoad(IdentityConfig.JwtSecret);
        if (!JWT_SECRET) {
            throw new Error("JWT_SECRET ENV must be provided");
        }

        const options: SignOptions = {
            algorithm: 'HS256'
        };

        return jsonwebtoken.sign(tokenPayload, JWT_SECRET, options);
    }
}

export default AuthUtils
export {AuthUtils}
