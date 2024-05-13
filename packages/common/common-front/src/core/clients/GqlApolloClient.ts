import type {IGqlClientInterface, IGqlOptionsInterface} from "../interfaces/IGqlClientInterface";

class GqlApolloClient implements IGqlClientInterface {

  baseUrl: string;
  baseHeaders: Headers;

  constructor(baseUrl: string, baseHeaders: Headers) {
    this.baseUrl = baseUrl;
    this.baseHeaders = baseHeaders;
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
