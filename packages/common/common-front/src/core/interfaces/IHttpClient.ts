interface IHttpHeader {
  [headerName: string]: string;
}

interface IHttpParam {
  [paramName: string]: string | number;
}

interface IHttpOptions {
  headers?: IHttpHeader;
  params?: IHttpParam
}

interface IHttpClient {
  get(url: string, options?: IHttpOptions): Promise<object>

  post(url: string, data: any, options?: IHttpOptions): Promise<object>

  put(url: string, data: any, options?: IHttpOptions): Promise<object>

  delete(url: string, data: any, options?: IHttpOptions): Promise<object>

  patch(url: string, data: any, options?: IHttpOptions): Promise<object>

  addHeader(name: string, value: string): void

  removeHeader(name: string): void
}

export type {IHttpClient, IHttpOptions, IHttpHeader}
