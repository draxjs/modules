import type {IHttpClientInterface} from '@drax/common-front'
import type {IAuthProviderInterface} from "@/core/interfaces/IAuthProviderInterface";
class AuthRestProvider implements IAuthProviderInterface{

    httpClient : IHttpClientInterface
    constructor(httpClient: IHttpClientInterface) {
        this.httpClient = httpClient
    }
    async login(username: string, password: string): Promise<string> {
        const url = '/api/auth'
        const data = {username,password}
        let r = this.httpClient.post(url,data)

        return r
    }
}

export default AuthRestProvider
export {AuthRestProvider}
