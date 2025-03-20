
import type {IHttpClient} from '@drax/common-front'
import type {IAuthProvider} from "../../interfaces/IAuthProvider";
import type {IAuthUser} from "../../interfaces/IAuthUser";
import type {ILoginResponse} from "../../interfaces/ILoginResponse";
import type {IUserRegistration} from "@/interfaces/IUserRegistration";


class AuthRestProvider implements IAuthProvider {

    httpClient: IHttpClient

    constructor(httpClient: IHttpClient) {
        this.httpClient = httpClient
    }

    setHttpClientToken(token: string): void {
        this.httpClient.addHeader('Authorization', `Bearer ${token}`)
    }

    removeHttpClientToken(): void {
        this.httpClient.removeHeader('Authorization')
    }

    async login(username: string, password: string): Promise<ILoginResponse> {
            const url = '/api/auth/login'
            const data = {username, password}
            let {accessToken} = await this.httpClient.post(url, data) as ILoginResponse
            this.setHttpClientToken(accessToken)
            return {accessToken}
    }

    logout(): void {
        this.removeHttpClientToken()
    }

    async me(): Promise<IAuthUser> {
            const url = '/api/auth/me'
            let r = await this.httpClient.get(url) as IAuthUser
            return r
    }

    async changeOwnPassword(currentPassword: string, newPassword: string): Promise<boolean> {
        const url = '/api/users/password/change'
        const data = {currentPassword, newPassword}
        let r = await this.httpClient.post(url, data)
        return /true/i.test(r as string)
    }

    async recoveryPasswordRequest(email: string): Promise<boolean> {
        const url = '/api/users/password/recovery/request'
        const data = {email}
        let r = await this.httpClient.post(url, data)
        return /true/i.test(r as string)
    }


    async recoveryPasswordComplete(recoveryCode: string, newPassword: string): Promise<boolean> {
        const url = '/api/users/password/recovery/complete'
        const data = {recoveryCode, newPassword}
        let r = await this.httpClient.post(url, data)
        return /true/i.test(r as string)
    }

    async register(form: IUserRegistration): Promise<{success: boolean; message: string}> {
        const url = '/api/users/register'
        let r = await this.httpClient.post(url, form)
        return r as {success: boolean; message: string}
    }

    async changeAvatar(file: File): Promise<boolean> {
        const url = '/api/users/avatar'
        const data = new FormData()
        data.append('file', file)
        let r = await this.httpClient.post(url, data, {removeHeaders: ['content-type']})
        return /true/i.test(r as string)
    }
}

export default AuthRestProvider
export {AuthRestProvider}
