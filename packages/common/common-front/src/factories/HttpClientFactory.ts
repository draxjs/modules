import {HttpRestClientFactory } from "./HttpRestClientFactory";
import { HttpGqlClientFactory } from "./HttpGqlClientFactory";
import { HttpRestClient, } from "../clients/HttpRestClient";
import { HttpGqlClient} from "../clients/HttpGqlClient";

const HTTP_TRANSPORT = import.meta.env.VITE_HTTP_TRANSPORT || 'REST';

class HttpClientFactory {

  static instance: HttpRestClient | HttpGqlClient | null = null

  static getInstance(httpTransport: string = HTTP_TRANSPORT, url: string = ''): HttpRestClient | HttpGqlClient {
    if (!this.instance) {
      switch (httpTransport) {
        case 'GRAPHQL':
          this.instance = HttpGqlClientFactory.getInstance(url)
          break
        case 'REST':
          this.instance = HttpRestClientFactory.getInstance(url)
          break
        default:
          throw new Error('HttpClientFactory ERROR: Invalid HTTP_TRANSPORT environment variable')
      }
    }
    return this.instance
  }

}

export default HttpClientFactory
