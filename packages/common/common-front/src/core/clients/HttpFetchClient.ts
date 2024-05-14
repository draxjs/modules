import type {IHttpClientInterface, IHttpOptionsInterface} from "../interfaces/IHttpClientInterface";

class HttpFetchClient implements IHttpClientInterface {

  baseUrl: string;
  baseHeaders: Headers;
  constructor(baseUrl: string = '', baseHeaders : Headers = new Headers()) {
    this.baseUrl = baseUrl;
    this.baseHeaders = baseHeaders;
  }

  addHeader(name: string, value: string): void {
    this.baseHeaders.set(name,value)
  }

  removeHeader(name: string): void {
    this.baseHeaders.delete(name)
  }

  mergeHeaders(optionHeaders: Headers): Headers {
    const mergedHeaders = new Headers(this.baseHeaders);
    optionHeaders.forEach((value, name) => {
      mergedHeaders.set(name, value)
    })
    console.log("mergedHeaders",mergedHeaders)
    return mergedHeaders;
  }

  async get(url: string, options: IHttpOptionsInterface): Promise<object> {
    url = this.baseUrl + url;
    const headers =  options?.headers ? this.mergeHeaders(options.headers) : this.baseHeaders
    console.log("get.headers",headers)
    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    });
    return response.json();
  }

  async post(url: string, data: any, options: IHttpOptionsInterface): Promise<object> {
    url = this.baseUrl + url;
    const headers =  options?.headers ? this.mergeHeaders(options.headers) : this.baseHeaders
    console.log("post.headers",headers)
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async put(url: string, data: any, options: IHttpOptionsInterface): Promise<object> {
    url = this.baseUrl + url;

    const response = await fetch(url, {
      method: 'PUT',
      headers: this.mergeHeaders(options?.headers),
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async delete(url: string, data: any, options: IHttpOptionsInterface): Promise<object> {
    url = this.baseUrl + url;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.mergeHeaders(options?.headers),
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async patch(url: string, data: any, options: IHttpOptionsInterface): Promise<object> {
    url = this.baseUrl + url;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.mergeHeaders(options?.headers),
      body: JSON.stringify(data),
    });
    return response.json();
  }


}

export default HttpFetchClient
export {HttpFetchClient}
