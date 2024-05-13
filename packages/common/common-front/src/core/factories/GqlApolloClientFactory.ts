import GqlApolloClient from "../clients/GqlApolloClient";

class GqlApolloClientFactory{

  static create(baseUrl: string, baseHeaders ?: object) : GqlApolloClient {
    return new GqlApolloClient(baseUrl)
  }
}

export default GqlApolloClientFactory
export {GqlApolloClientFactory}
