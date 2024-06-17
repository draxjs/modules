interface IHttpError {
  message: string;
  statusCode: number;
  body: any;
}

export type {IHttpError}
