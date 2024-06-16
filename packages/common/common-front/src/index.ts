import HttpGqlClient from './core/clients/HttpGqlClient';
import HttpRestClient from './core/clients/HttpRestClient';
import HttpError from './core/errors/http/HttpError';
import HttpStatusError from './core/errors/http/HttpStatusError';
import HttpTimeoutError from './core/errors/http/HttpTimeoutError';
import HttpNetworkError from './core/errors/http/HttpNetworkError';
import UnknownError from './core/errors/UnknownError';
import ServerError from './core/errors/ServerError';
import ClientError from './core/errors/ClientError';
import HttpFetchClientFactory from './core/factories/HttpFetchClientFactory';
import GqlApolloClientFactory from './core/factories/GqlApolloClientFactory';

import type {IHttpClient, IHttpOptions} from './core/interfaces/IHttpClient';
import type {IGqlClient, IGqlOptions} from './core/interfaces/IGqlClient';
import type {IHttpError} from './core/interfaces/IHttpError';

export {
  HttpRestClient,
  HttpFetchClientFactory,
  HttpGqlClient,
  GqlApolloClientFactory,
  HttpError,
  HttpStatusError,
  HttpTimeoutError,
  HttpNetworkError,
  ServerError,
  ClientError,
  UnknownError
}

export type {
  IHttpClient,
  IHttpOptions,
  IGqlClient,
  IGqlOptions,
  IHttpError
}





