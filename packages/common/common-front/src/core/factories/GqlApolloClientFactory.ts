import GqlApolloClient from "../clients/HttpFetchClient";

class GqlApolloClientFactory{

  static create(baseUrl: string, baseHeaders: Headers) {
    return new GqlApolloClient(baseUrl, baseHeaders)
  }
}

export default GqlApolloClientFactory
export {GqlApolloClientFactory}
