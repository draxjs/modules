import HttpGqlClient from "../clients/HttpGqlClient";

class HttpGqlClientFactory {

  static create(baseUrl: string, baseHeaders ?: object) : HttpGqlClient {
    return new HttpGqlClient(baseUrl)
  }
}

export default HttpGqlClientFactory
export {HttpGqlClientFactory}
