import HttpGqlClient from './clients/HttpGqlClient';
import HttpRestClient from './clients/HttpRestClient';
import HttpError from './errors/http/HttpError';
import HttpStatusError from './errors/http/HttpStatusError';
import HttpTimeoutError from './errors/http/HttpTimeoutError';
import HttpNetworkError from './errors/http/HttpNetworkError';
import UnknownError from './errors/UnknownError';
import ServerError from './errors/ServerError';
import ClientError from './errors/ClientError';
import NetworkError from './errors/NetworkError';
import HttpFetchClientFactory from './factories/HttpFetchClientFactory';
import GqlApolloClientFactory from './factories/GqlApolloClientFactory';

import type {IHttpClient, IHttpOptions} from './interfaces/IHttpClient';
import type {IGqlClient, IGqlOptions} from './interfaces/IGqlClient';
import type {IHttpError} from './interfaces/IHttpError';
import type {IInputError} from './interfaces/IInputError';
import type {IClientInputError} from './interfaces/IClientInputError';

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
  NetworkError,
  UnknownError,
}

export type {
  IHttpClient,
  IHttpOptions,
  IGqlClient,
  IGqlOptions,
  IHttpError,
  IInputError,
  IClientInputError
}





