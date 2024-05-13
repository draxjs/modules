import type {IGqlClientInterface, IGqlOptionsInterface} from "../interfaces/IGqlClientInterface";

class GqlApolloClient implements IGqlClientInterface {

  baseUrl: string;

  constructor(baseUrl: string = '/graphql') {
    this.baseUrl = baseUrl;
  }

  async query(url: string, input: any, options: IGqlOptionsInterface): Promise<object> {
    url = this.baseUrl + url;
    return {}
  }

  async mutation(url: string, input: any, options: IGqlOptionsInterface): Promise<object> {
    url = this.baseUrl + url;
    return {}
  }


}

export default GqlApolloClient
