import GqlApolloClient from './core/clients/GqlApolloClient';
import HttpFetchClient from './core/clients/HttpFetchClient';
import HttpFetchClientFactory from './core/factories/HttpFetchClientFactory';
import GqlApolloClientFactory from './core/factories/GqlApolloClientFactory';

import type {IHttpClientInterface, IHttpOptionsInterface} from './core/interfaces/IHttpClientInterface';
import type {IGqlClientInterface, IGqlOptionsInterface} from './core/interfaces/IGqlClientInterface';

export type {
  IHttpClientInterface,
  IHttpOptionsInterface,
  IGqlClientInterface,
  IGqlOptionsInterface
}

export {
  HttpFetchClient,
  HttpFetchClientFactory,
  GqlApolloClient,
  GqlApolloClientFactory
}



