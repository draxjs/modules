import {jwtDecodeHelper} from './JwtDecodeHelper.js'
import type {JwtPayload} from './JwtDecodeHelper'

class AuthHelper {

    static isJWTValid(accessToken: string) {
        try {

            if (!accessToken) return false

            let payload = jwtDecodeHelper(accessToken) as JwtPayload

            if (!payload.exp) return false

            let dateToken = new Date(payload.exp * 1000)

            let now = new Date()
            if (now > dateToken) return false

            return true

        } catch (err) {
            console.error("isJWTValid", err)
            return false
        }

    }

}

export default AuthHelper
export {AuthHelper}
