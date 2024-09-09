import {HttpGqlClient} from "@drax/common-front";

class HttpGqlClientFactory{

  static instance: HttpGqlClient|null = null

  static getInstance(url:string = '/graphql'): HttpGqlClient {
    if (!this.instance) {
      this.instance = new HttpGqlClient(url)
    }
    return this.instance  // Return singleton instance
  }

}

export default HttpGqlClientFactory
