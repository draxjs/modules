import type {IHttpClientInterface} from '@drax/common-front'
import type {IAuthProviderInterface} from "../../interfaces/IAuthProviderInterface.ts";
class AuthRestProvider implements IAuthProviderInterface{

    httpClient : IHttpClientInterface
    constructor(httpClient: IHttpClientInterface) {
        this.httpClient = httpClient
    }
    async login(username: string, password: string): Promise<object> {
        const url = '/api/auth'
        const data = {username,password}
        let r = await this.httpClient.post(url,data)

        return r
    }
}

export default AuthRestProvider
export {AuthRestProvider}
