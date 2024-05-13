import HttpFetchClient from "../clients/HttpFetchClient";

class HttpFetchClientFactory{

  static create(baseUrl: string, baseHeaders: Headers) {
    return new HttpFetchClient(baseUrl, baseHeaders)
  }
}

export default HttpFetchClientFactory
export {HttpFetchClientFactory}
