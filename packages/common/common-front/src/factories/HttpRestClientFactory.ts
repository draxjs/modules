import {HttpRestClient} from "@drax/common-front";

class HttpRestClientFactory {

  static instance: HttpRestClient | null = null

  static getInstance(url: string = ''): HttpRestClient {
    if (!this.instance) {
      this.instance = new HttpRestClient(url)
    }
    return this.instance  // Return singleton instance
  }

}

export default HttpRestClientFactory
