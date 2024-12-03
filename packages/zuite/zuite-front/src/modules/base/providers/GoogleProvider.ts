import {HttpRestClientFactory, IHttpClient} from "@drax/common-front";
import {useAuth} from "@drax/identity-vue";


class GoogleProvider {

  static singleton: GoogleProvider

  httpClient: IHttpClient
  basePath: string = '/api/google'

  constructor() {
    this.httpClient = HttpRestClientFactory.getInstance()
  }

  setHttpClientToken(token: string): void {
    this.httpClient.addHeader('Authorization', `Bearer ${token}`)
  }

  removeHttpClientToken(): void {
    this.httpClient.removeHeader('Authorization')
  }

  static get instance() {
    if(!GoogleProvider.singleton){
      GoogleProvider.singleton = new GoogleProvider()
    }
    return GoogleProvider.singleton
  }

  async login(credential: string): Promise<any> {
    const url = this.basePath + '/login'
    const response:any = await this.httpClient.post(url, {credential}, {timeout: 120000})
    const {loginWithToken} = useAuth()
    this.setHttpClientToken(response.accessToken)
    await loginWithToken(response.accessToken)
    return response
  }

  async logout(): Promise<any> {
    const url = this.basePath + '/logout'
    const response = await this.httpClient.post(url, {}, {timeout: 120000})
    return response
  }

}

export default GoogleProvider

