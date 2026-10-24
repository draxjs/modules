import type {IHttpClient, IHttpHeader, IHttpOptions} from "../interfaces/IHttpClient";
import HttpStatusError from "../errors/http/HttpStatusError";
import NetworkError from "../errors/NetworkError";
import ServerError from "../errors/ServerError";
import ClientError from "../errors/ClientError";
import UnknownError from "../errors/UnknownError";

class HttpRestClient implements IHttpClient {

  baseUrl: string;
  baseHeaders: IHttpHeader;
  private timeout: number;
  private beforeRequest?: (url: string) => Promise<void>;

  setBeforeRequest(handler: (url: string) => Promise<void>): void {
    this.beforeRequest = handler;
  }

  constructor(baseUrl: string = '',  baseHeaders: IHttpHeader = {'content-type': 'application/json'}, timeout : number = 60000) {
    this.baseUrl = baseUrl;
    this.baseHeaders = baseHeaders;
    this.timeout = timeout;
  }

  setTimeout(timeout: number): void {
    this.timeout = timeout;
  }

  getBaseHeaders(): IHttpHeader{
    return this.baseHeaders
  }

  getHeaderValue(name: string): string {
    return this.baseHeaders[name] ?? ''
  }

  addHeader(name: string, value: string): void {
    this.baseHeaders[name] = value;
  }

  removeHeader(name: string): void {
    delete this.baseHeaders[name];
  }

  private isAbortError(error: Error): boolean {
    return error.name === 'AbortError';
  }

  private async prepareRequest(url: string, options?: IHttpOptions): Promise<void> {
    if (options?.removeHeaders?.some(header => header.toLowerCase() === 'authorization')) return;
    if (this.beforeRequest) await this.beforeRequest(url);
  }

  private resolveHeaders(options?: IHttpOptions): IHttpHeader {
    const headers = {...this.baseHeaders, ...options?.headers};
    const removed = new Set(options?.removeHeaders?.map(header => header.toLowerCase()));
    for (const header of Object.keys(headers)) {
      if (removed.has(header.toLowerCase())) delete headers[header];
    }
    return headers;
  }

  private resolveTimeout(options?: IHttpOptions): number {
    return options?.timeout ?? this.timeout;
  }

  private handleRequestError(method: string, url: string, timeout: number, error: Error): never {
    if (this.isAbortError(error)) {
      console.error(`[HttpRestClient] ${method} ${url} aborted by AbortController after ${timeout}ms`, error);
    } else {
      console.error(`[HttpRestClient] ${method} ${url} failed`, error);
    }

    throw this.errorHandler(error);
  }

  errorHandler(error: Error): Error {
    // console.error('HttpRestClient Error:', error);
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


  async get(url: string, options?: IHttpOptions): Promise<object> {
    await this.prepareRequest(url, options);
    const controller = new AbortController();
    const timeout = this.resolveTimeout(options);
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const queryParams = new URLSearchParams(options?.params as any).toString();
      url = this.baseUrl + url + (queryParams ? `?${queryParams}` : '');
      const headers = this.resolveHeaders(options);
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
        signal: controller.signal,
      });

      if (!response.ok) {
        const body: string = await response.json();
        throw new HttpStatusError(response.status, body);
      }

      return response.json();
    } catch (error) {
      this.handleRequestError('GET', url, timeout, error as Error);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async post(url: string, data: any, options?: IHttpOptions): Promise<object> {
    await this.prepareRequest(url, options);
    const controller = new AbortController();
    const timeout = this.resolveTimeout(options);
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      url = this.baseUrl + url;
      const headers = this.resolveHeaders(options);
      data = data instanceof FormData ? data : JSON.stringify(data);
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body:  data,
        signal: controller.signal,
      });

      if (!response.ok) {
        const body: string = await response.json();
        throw new HttpStatusError(response.status, body);
      }

      return response.json();
    } catch (error) {
      this.handleRequestError('POST', url, timeout, error as Error);
    } finally {
      clearTimeout(timeoutId);
    }

  }

  async put(url: string, data: any, options?: IHttpOptions): Promise<object> {
    await this.prepareRequest(url, options);
    const controller = new AbortController();
    const timeout = this.resolveTimeout(options);
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      url = this.baseUrl + url;
      const headers = this.resolveHeaders(options);
      data = data instanceof FormData ? data : JSON.stringify(data);
      const response = await fetch(url, {
        method: 'PUT',
        headers: headers,
        body: data,
        signal: controller.signal,
      });

      if (!response.ok) {
        const body: string = await response.json();
        throw new HttpStatusError(response.status, body);
      }

      return response.json();
    } catch (error) {
      this.handleRequestError('PUT', url, timeout, error as Error);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async delete(url: string, data?: any, options?: IHttpOptions): Promise<object> {
    await this.prepareRequest(url, options);
    const controller = new AbortController();
    const timeout = this.resolveTimeout(options);
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      url = this.baseUrl + url;
      data = data ? data : {}
      const headers = this.resolveHeaders(options);
      data = data instanceof FormData ? data : JSON.stringify(data);
      const response = await fetch(url, {
        method: 'DELETE',
        headers: headers,
        body: data,
        signal: controller.signal,
      });

      if (!response.ok) {
        const body: string = await response.json();
        throw new HttpStatusError(response.status, body);
      }

      return response.json();
    } catch (error) {
      this.handleRequestError('DELETE', url, timeout, error as Error);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async patch(url: string, data: any, options?: IHttpOptions): Promise<object> {
    await this.prepareRequest(url, options);
    const controller = new AbortController();
    const timeout = this.resolveTimeout(options);
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      url = this.baseUrl + url;
      const headers = this.resolveHeaders(options);
      const response = await fetch(url, {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      if (!response.ok) {
        const body: string = await response.json();
        throw new HttpStatusError(response.status, body);
      }

      return response.json();
    } catch (error) {
      this.handleRequestError('PATCH', url, timeout, error as Error);
    } finally {
      clearTimeout(timeoutId);
    }
  }


}

export default HttpRestClient
export {HttpRestClient}
