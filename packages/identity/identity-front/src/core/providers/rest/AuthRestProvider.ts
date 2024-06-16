import {
    ClientError,
    HttpNetworkError,
    HttpStatusError,
    HttpTimeoutError,
    ServerError,
    UnknownError
} from '@drax/common-front'
import type {IHttpClient} from '@drax/common-front'
import type {IAuthProvider} from "../../interfaces/IAuthProvider";
import type {IAuthUser} from "../../interfaces/IAuthUser";
import type {ILoginResponse} from "../../interfaces/ILoginResponse";
import BadCredentialsError from "../../errors/BadCredentialsError";


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
        const url = '/api/auth'
        const data = {username, password}
        try {
            let {accessToken} = await this.httpClient.post(url, data) as ILoginResponse
            this.setHttpClientToken(accessToken)
            return {accessToken}
        } catch (error) {
            if (error instanceof HttpStatusError && error.statusCode === 401) {
                if(error.statusCode === 401){
                    throw new BadCredentialsError()
                }else if(error.statusCode >= 400 && error.statusCode <= 499){
                    throw new ClientError(error)
                }else if(error.statusCode >= 500 && error.statusCode <= 599){
                    throw new ServerError(error)
                }else{
                    throw new UnknownError(error)
                }
            } else if (error instanceof HttpTimeoutError || error instanceof HttpNetworkError) {
                throw error
            } else {
                throw new UnknownError(error as Error)
            }

        }

    }

    logout(): void {
        this.removeHttpClientToken()
    }

    async me(): Promise<IAuthUser> {
        const url = '/api/me'
        let r = await this.httpClient.get(url) as IAuthUser
        return r
    }
}

export default AuthRestProvider
export {AuthRestProvider}
