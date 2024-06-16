import type {IHttpClient, IHttpHeader, IHttpOptions} from "../interfaces/IHttpClient";
import HttpError from "../errors/http/HttpError";
import HttpStatusError from "../errors/http/HttpStatusError";
import HttpTimeoutError from "../errors/http/HttpTimeoutError";
import HttpNetworkError from "../errors/http/HttpNetworkError";

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

  addHeader(name: string, value: string): void {
    this.baseHeaders[name] = value;
  }

  removeHeader(name: string): void {
    delete this.baseHeaders[name];
  }


  errorHandler(error: Error): Error {
    if (error instanceof HttpStatusError) {
      return error
    }else if (error.name === 'AbortError') {
      return new HttpTimeoutError()
    } else if (error.name === 'TypeError') {
      return new HttpNetworkError()
    }else{
      const message: string = error.message;
      const statusCode: number = 0
      const body: string | undefined = error.stack
      return new HttpError(message, statusCode, body);
    }
  }


  async get(url: string, options: IHttpOptions): Promise<object> {

    try {
      url = this.baseUrl + url;
      const headers: IHttpHeader = {...this.baseHeaders, ...options?.headers};
      const timeoutId = setTimeout(() => this.controller.abort(), this.timeout)
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
      throw this.errorHandler(error as Error)
    }
  }

  async post(url: string, data: any, options: IHttpOptions): Promise<object> {
    try {
      url = this.baseUrl + url;
      const headers: IHttpHeader = {...this.baseHeaders, ...options?.headers};
      console.log("this.defaultTimeout",this.timeout)
      const timeoutId = setTimeout(() => this.controller.abort(), this.timeout)
      const response = await fetch(url, {
        method: 'POST',
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

  async put(url: string, data: any, options: IHttpOptions): Promise<object> {
    try {
      url = this.baseUrl + url;
      const headers = {...this.baseHeaders, ...options?.headers};
      const timeoutId = setTimeout(() => this.controller.abort(), this.timeout)
      const response = await fetch(url, {
        method: 'PUT',
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

  async delete(url: string, data: any, options: IHttpOptions): Promise<object> {

    try {
      url = this.baseUrl + url;
      const headers: IHttpHeader = {...this.baseHeaders, ...options?.headers};
      const timeoutId = setTimeout(() => this.controller.abort(), this.timeout)
      const response = await fetch(url, {
        method: 'DELETE',
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

  async patch(url: string, data: any, options: IHttpOptions): Promise<object> {
    try {
      url = this.baseUrl + url;
      const headers: IHttpHeader = {...this.baseHeaders, ...options?.headers};
      const timeoutId = setTimeout(() => this.controller.abort(), this.timeout)
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
