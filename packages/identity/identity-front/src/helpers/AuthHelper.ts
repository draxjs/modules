import {jwtDecodeHelper} from './JwtDecodeHelper.js'
import type {JwtPayload} from './JwtDecodeHelper'

class AuthHelper {

    /** Local structure/expiration check only; does not verify the signature or authorize a request. */
    static isJWTValid(accessToken: string, marginSeconds: number = 0): boolean {
        try {
            if (typeof accessToken !== 'string' || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(accessToken)) return false
            if (!Number.isFinite(marginSeconds) || marginSeconds < 0) return false

            const header = jwtDecodeHelper(accessToken, {header: true})
            const payload = jwtDecodeHelper(accessToken) as JwtPayload
            if (!header || typeof header !== 'object' || Array.isArray(header)) return false
            if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false
            if (typeof payload.exp !== 'number' || !Number.isFinite(payload.exp)) return false

            return payload.exp > Date.now() / 1000 + marginSeconds
        } catch {
            return false
        }
    }

}

export default AuthHelper
export {AuthHelper}
