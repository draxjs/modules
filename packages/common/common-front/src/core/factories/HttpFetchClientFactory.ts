import HttpRestClient from "../clients/HttpRestClient";

class HttpFetchClientFactory{

  static create(baseUrl: string, baseHeaders: Headers) {
    return new HttpRestClient(baseUrl, baseHeaders)
  }
}

export default HttpFetchClientFactory
export {HttpFetchClientFactory}
