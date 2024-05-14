import type {IHttpClientInterface} from '@drax/common-front'
import type {IAuthProvider} from "@/core/interfaces/IAuthProvider";
import type {IAuthUser} from "@/core/interfaces/IAuthUser";
import type {ILoginResponse} from "@/core/interfaces/ILoginResponse";


class AuthRestProvider implements IAuthProvider{

    httpClient : IHttpClientInterface
    constructor(httpClient: IHttpClientInterface) {
        this.httpClient = httpClient
    }

    setToken(token: string): void {
        this.httpClient.addHeader('Authorization', `Bearer ${token}`)
    }

    removeToken(): void {
        this.httpClient.removeHeader('Authorization')
    }

    async login(username: string, password: string): Promise<ILoginResponse> {
        const url = '/api/auth'
        const data = {username,password}
        let {accessToken} = await this.httpClient.post(url,data) as ILoginResponse
        this.setToken(accessToken)
        return {accessToken}
    }

    logout(): void {
        this.removeToken()
    }

    async me(): Promise<IAuthUser> {
        const url = '/api/me'
        let r = await this.httpClient.get(url) as IAuthUser
        return r
    }
}

export default AuthRestProvider
export {AuthRestProvider}
