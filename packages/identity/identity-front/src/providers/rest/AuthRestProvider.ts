
import type {IHttpClient} from '@drax/common-front'
import type {IAuthProvider} from "../../interfaces/IAuthProvider";
import type {IAuthFullUser} from "../../interfaces/IAuthFullUser";
import type {ILoginResponse} from "../../interfaces/ILoginResponse";
import type {IPasswordPolicy} from "../../interfaces/IPasswordPolicy";
import type {IUserRegistration} from "../../interfaces/IUserRegistration";
import type {IRegistrationOptions} from "../../interfaces/IRegistrationOptions";
import type {IRegistrationResponse} from "../../interfaces/IRegistrationResponse";
import type {IVerificationResendResponse} from "../../interfaces/IVerificationResendResponse";


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

    async login(username: string, password: string, rememberMe?: boolean): Promise<ILoginResponse> {
        const data = {username, password, ...(rememberMe === true ? {rememberMe: true} : {})}
        const result = await this.httpClient.post('/api/auth/login', data, {removeHeaders: ['Authorization']}) as ILoginResponse
        this.setHttpClientToken(result.accessToken)
        return result
    }

    async refresh(refreshToken: string): Promise<ILoginResponse> {
        // The session owner commits credentials only if no logout/new login intervened.
        return await this.httpClient.post('/api/auth/refresh', {refreshToken}, {removeHeaders: ['Authorization']}) as ILoginResponse
    }

    async revokeSession(refreshToken: string): Promise<void> {
        await this.httpClient.post('/api/auth/logout', {refreshToken}, {removeHeaders: ['Authorization']})
    }

    async switchTenant(tenantId: string): Promise<ILoginResponse> {
        const url = '/api/auth/switch-tenant'
        const data = {tenantId}
        let {accessToken} = await this.httpClient.post(url, data) as ILoginResponse
        this.setHttpClientToken(accessToken)
        return {accessToken}
    }

    logout(): void {
        this.removeHttpClientToken()
    }

    async me(): Promise<IAuthFullUser> {
            const url = '/api/auth/me'
            let r = await this.httpClient.get(url) as IAuthFullUser
            return r
    }

    async registrationOptions(): Promise<IRegistrationOptions> {
        return await this.httpClient.get('/api/auth/registration-options', {removeHeaders: ['Authorization']}) as IRegistrationOptions
    }

    async passwordPolicy(): Promise<IPasswordPolicy> {
        const url = '/api/auth/password-policy'
        return await this.httpClient.get(url, {removeHeaders: ['Authorization']}) as IPasswordPolicy
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
        let r = await this.httpClient.post(url, data, {removeHeaders: ['Authorization']})
        return /true/i.test(r as string)
    }


    async recoveryPasswordComplete(recoveryCode: string, newPassword: string): Promise<boolean> {
        const url = '/api/users/password/recovery/complete'
        const data = {recoveryCode, newPassword}
        let r = await this.httpClient.post(url, data, {removeHeaders: ['Authorization']})
        return /true/i.test(r as string)
    }

    async resendVerificationEmail(email: string): Promise<IVerificationResendResponse> {
        return await this.httpClient.post('/api/users/verification/resend', {email}, {removeHeaders: ['Authorization']}) as IVerificationResendResponse
    }

    async register(form: IUserRegistration): Promise<IRegistrationResponse> {
        const url = '/api/users/register'
        let r = await this.httpClient.post(url, form, {removeHeaders: ['Authorization']})
        return r as IRegistrationResponse
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
