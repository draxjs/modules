interface IHttpHeader {
  [headerName: string]: string;
}

interface IHttpParam {
  [paramName: string]: string | number | boolean;
}

interface IHttpOptions {
  headers?: IHttpHeader;
  /** Case-insensitive, request-local removal. Removing Authorization also skips the before-request hook. */
  removeHeaders?: string[]
  params?: IHttpParam,
  timeout?: number
}

interface IHttpClient {
  /** Awaited before copying headers, except for requests explicitly removing Authorization. */
  setBeforeRequest?(handler: (url: string) => Promise<void>): void

  get(url: string, options?: IHttpOptions): Promise<object|string>

  post(url: string, data: any, options?: IHttpOptions): Promise<object|string>

  put(url: string, data: any, options?: IHttpOptions): Promise<object|string>

  delete(url: string, data?: any, options?: IHttpOptions): Promise<object|string>

  patch(url: string, data: any, options?: IHttpOptions): Promise<object|string>

  addHeader(name: string, value: string): void

  removeHeader(name: string): void

  getBaseHeaders(): IHttpHeader

  getHeaderValue(name: string): string
}

export type {IHttpClient, IHttpOptions, IHttpHeader}
