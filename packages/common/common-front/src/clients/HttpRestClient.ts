import type {IHttpClient, IHttpHeader, IHttpOptions} from "../interfaces/IHttpClient";
import HttpStatusError from "../errors/http/HttpStatusError";
import NetworkError from "../errors/NetworkError";
import ServerError from "../errors/ServerError";
import ClientError from "../errors/ClientError";
import UnknownError from "../errors/UnknownError";

class HttpRestClient implements IHttpClient {

  baseUrl: string;
  baseHeaders: IHttpHeader;
  private signal: AbortSignal;
  private controller: AbortController;
  private timeout: number;

  constructor(baseUrl: string = '',  baseHeaders: IHttpHeader = {'content-type': 'application/json'}, timeout : number = 10000) {
    this.baseUrl = baseUrl;
    this.baseHeaders = baseHeaders;
    this.timeout = timeout;

    this.controller = new AbortController();
    this.signal = this.controller.signal;
  }

  setTimeout(timeout: number): void {
    this.timeout = timeout;
  }

  addHeader(name: string, value: string): void {
    this.baseHeaders[name] = value;
  }

  removeHeader(name: string): void {
    delete this.baseHeaders[name];
  }


  errorHandler(error: Error): Error {
    if (error instanceof HttpStatusError && error.statusCode >= 400 && error.statusCode <= 599) {
      if(error.statusCode >= 400 && error.statusCode <= 499){
        return new ClientError(error)
      }else if(error.statusCode >= 500 && error.statusCode <= 599){
        return new ServerError(error)
      }else{
        console.log("UnknownError",error)
        return new UnknownError(error);
      }
    }else if (error.name === 'AbortError') {
      return new ServerError(error)
    } else if (error.name === 'TypeError') {
      return new NetworkError(error);
    }else{
      return new UnknownError(error);
    }
  }


  async get(url: string, options: IHttpOptions): Promise<object> {

    try {
      const queryParams = new URLSearchParams(options?.params as any).toString();
      url = this.baseUrl + url + (queryParams ? `?${queryParams}` : '');
      const headers: IHttpHeader = {...this.baseHeaders, ...options?.headers};
      if(options?.removeHeaders){
        options?.removeHeaders.forEach(header => delete headers[header]);
      }
      const timeout = options?.timeout ? options.timeout : this.timeout;
      const timeoutId = setTimeout(() => this.controller.abort(), timeout)
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
        signal: this.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const body: string = await response.json();
        throw new HttpStatusError(response.status, body);
      }

      return response.json();
    } catch (error) {
      console.log("httpRestClient: get error", error)
      throw this.errorHandler(error as Error)
    }
  }

  async post(url: string, data: any, options: IHttpOptions): Promise<object> {
    try {
      url = this.baseUrl + url;
      const headers: IHttpHeader = {...this.baseHeaders, ...options?.headers};
      if(options?.removeHeaders){
        options?.removeHeaders.forEach(header => delete headers[header]);
      }
      const timeout = options?.timeout ? options.timeout : this.timeout;
      const timeoutId = setTimeout(() => this.controller.abort(), timeout)
      data = data instanceof FormData ? data : JSON.stringify(data);
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body:  data,
        signal: this.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const body: string = await response.json();
        throw new HttpStatusError(response.status, body);
      }

      return response.json();
    } catch (error) {
      throw this.errorHandler(error as Error)
    }

  }

  async put(url: string, data: any, options: IHttpOptions): Promise<object> {
    try {
      url = this.baseUrl + url;
      const headers = {...this.baseHeaders, ...options?.headers};
      if(options?.removeHeaders){
        options?.removeHeaders.forEach(header => delete headers[header]);
      }
      const timeout = options?.timeout ? options.timeout : this.timeout;
      const timeoutId = setTimeout(() => this.controller.abort(), timeout)
      data = data instanceof FormData ? data : JSON.stringify(data);
      const response = await fetch(url, {
        method: 'PUT',
        headers: headers,
        body: data,
        signal: this.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const body: string = await response.json();
        throw new HttpStatusError(response.status, body);
      }

      return response.json();
    } catch (error) {
      throw this.errorHandler(error as Error)
    }
  }

  async delete(url: string, data: any, options: IHttpOptions): Promise<object> {

    try {
      url = this.baseUrl + url;
      data = data ? data : {}
      const headers: IHttpHeader = {...this.baseHeaders, ...options?.headers};
      if(options?.removeHeaders){
        options?.removeHeaders.forEach(header => delete headers[header]);
      }
      const timeout = options?.timeout ? options.timeout : this.timeout;
      const timeoutId = setTimeout(() => this.controller.abort(), timeout)
      data = data instanceof FormData ? data : JSON.stringify(data);
      const response = await fetch(url, {
        method: 'DELETE',
        headers: headers,
        body: data,
        signal: this.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const body: string = await response.json();
        throw new HttpStatusError(response.status, body);
      }

      return response.json();
    } catch (error) {
      throw this.errorHandler(error as Error)
    }
  }

  async patch(url: string, data: any, options: IHttpOptions): Promise<object> {
    try {
      url = this.baseUrl + url;
      const headers: IHttpHeader = {...this.baseHeaders, ...options?.headers};
      const timeout = options?.timeout ? options.timeout : this.timeout;
      const timeoutId = setTimeout(() => this.controller.abort(), timeout)
      const response = await fetch(url, {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify(data),
        signal: this.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const body: string = await response.json();
        throw new HttpStatusError(response.status, body);
      }

      return response.json();
    } catch (error) {
      throw this.errorHandler(error as Error)
    }
  }


}

export default HttpRestClient
export {HttpRestClient}
