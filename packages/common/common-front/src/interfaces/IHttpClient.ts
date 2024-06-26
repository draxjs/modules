interface IHttpHeader {
  [headerName: string]: string;
}

interface IHttpParam {
  [paramName: string]: string | number | boolean;
}

interface IHttpOptions {
  headers?: IHttpHeader;
  params?: IHttpParam
}

interface IHttpClient {
  get(url: string, options?: IHttpOptions): Promise<object|string>

  post(url: string, data: any, options?: IHttpOptions): Promise<object|string>

  put(url: string, data: any, options?: IHttpOptions): Promise<object|string>

  delete(url: string, data?: any, options?: IHttpOptions): Promise<object|string>

  patch(url: string, data: any, options?: IHttpOptions): Promise<object|string>

  addHeader(name: string, value: string): void

  removeHeader(name: string): void
}

export type {IHttpClient, IHttpOptions, IHttpHeader}
