import HttpGqlClient from "../clients/HttpGqlClient";

class GqlApolloClientFactory{

  static create(baseUrl: string, baseHeaders ?: object) : HttpGqlClient {
    return new HttpGqlClient(baseUrl)
  }
}

export default GqlApolloClientFactory
export {GqlApolloClientFactory}
