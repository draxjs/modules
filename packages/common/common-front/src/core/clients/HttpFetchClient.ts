import type {IHttpClientInterface, IHttpOptionsInterface} from "../interfaces/IHttpClientInterface";

class HttpFetchClient implements IHttpClientInterface {

  baseUrl: string;
  baseHeaders: object;
  constructor(baseUrl: string = '', baseHeaders: object) {
    this.baseUrl = baseUrl;
    this.baseHeaders = baseHeaders;
  }

  async get(url: string, options: IHttpOptionsInterface): Promise<object> {
    url = this.baseUrl + url;
    const response = await fetch(url, {
      method: 'GET',
      headers: options?.headers,
    });
    return response.json();
  }

  async post(url: string, data: any, options: IHttpOptionsInterface): Promise<object> {
    url = this.baseUrl + url;
    const headers = {...this.baseHeaders, ...options?.headers }
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
      headers: options?.headers,
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async delete(url: string, data: any, options: IHttpOptionsInterface): Promise<object> {
    url = this.baseUrl + url;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: options?.headers,
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async patch(url: string, data: any, options: IHttpOptionsInterface): Promise<object> {
    url = this.baseUrl + url;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: options?.headers,
      body: JSON.stringify(data),
    });
    return response.json();
  }


}

export default HttpFetchClient
export {HttpFetchClient}
