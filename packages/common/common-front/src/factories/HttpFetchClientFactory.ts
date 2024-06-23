import HttpRestClient from "../clients/HttpRestClient";
import type {IHttpHeader} from "../interfaces/IHttpClient";

class HttpFetchClientFactory{

  static create(baseUrl: string, baseHeaders: IHttpHeader) {
    return new HttpRestClient(baseUrl, baseHeaders)
  }
}

export default HttpFetchClientFactory
export {HttpFetchClientFactory}
