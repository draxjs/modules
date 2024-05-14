interface IHttpHeader {
  [headerName: string]: string;
}

interface IHttpOptionsInterface {
  headers: IHttpHeader;
}

interface IHttpClientInterface {
  get(url: string, options?: IHttpOptionsInterface): Promise<object>

  post(url: string, data: any, options?: IHttpOptionsInterface): Promise<object>

  put(url: string, data: any, options?: IHttpOptionsInterface): Promise<object>

  delete(url: string, data: any, options?: IHttpOptionsInterface): Promise<object>

  patch(url: string, data: any, options?: IHttpOptionsInterface): Promise<object>

  addHeader(name: string, value: string): void

  removeHeader(name: string): void
}

export type {IHttpClientInterface, IHttpOptionsInterface, IHttpHeader}
