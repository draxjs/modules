import type {IHttpClientInterface, IHttpHeader, IHttpOptionsInterface} from "../interfaces/IHttpClientInterface";

class HttpFetchClient implements IHttpClientInterface {

  baseUrl: string;
  baseHeaders: IHttpHeader;
  constructor(baseUrl: string = '', baseHeaders : IHttpHeader = {}) {
    this.baseUrl = baseUrl;
    this.baseHeaders = baseHeaders;
  }

  addHeader(name: string, value: string): void {
    this.baseHeaders[name] = value;
  }

  removeHeader(name: string): void {
   delete this.baseHeaders[name];
  }


  async get(url: string, options: IHttpOptionsInterface): Promise<object> {
    url = this.baseUrl + url;
    const headers: IHttpHeader =  {...this.baseHeaders,...options?.headers };
    console.log("get.headers",headers)
    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    });
    return response.json();
  }

  async post(url: string, data: any, options: IHttpOptionsInterface): Promise<object> {
    url = this.baseUrl + url;
    const headers: IHttpHeader =  {...this.baseHeaders,...options?.headers };
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
    const headers =  {...this.baseHeaders,...options?.headers };

    const response = await fetch(url, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async delete(url: string, data: any, options: IHttpOptionsInterface): Promise<object> {
    url = this.baseUrl + url;
    const headers : IHttpHeader =  {...this.baseHeaders,...options?.headers };

    const response = await fetch(url, {
      method: 'DELETE',
      headers: headers,
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async patch(url: string, data: any, options: IHttpOptionsInterface): Promise<object> {
    url = this.baseUrl + url;
    const headers : IHttpHeader =  {...this.baseHeaders,...options?.headers };

    const response = await fetch(url, {
      method: 'PATCH',
      headers: headers,
      body: JSON.stringify(data),
    });
    return response.json();
  }


}

export default HttpFetchClient
export {HttpFetchClient}
