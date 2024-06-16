import {UserGqlProvider, UserRestProvider, UserSystem, IUserProvider} from "@drax/identity-front";
import {HttpGqlClient, HttpRestClient} from "@drax/common-front";

const REST = 'REST'
const GRAPHQL = 'GRAPHQL'
const CLIENTS = [REST, GRAPHQL]

export function userSystemFactory(HttpClient: string = REST): UserSystem {

  if (!CLIENTS.includes(HttpClient)) {
    throw new Error(`HttpClient must be one of ${CLIENTS}`)
  }

  const baseUrl: string = ''
  let userProvider: IUserProvider

  if (HttpClient === GRAPHQL) {
    userProvider = new UserGqlProvider(new HttpGqlClient('/graphql'))
  }else{
    userProvider = new UserRestProvider(new HttpRestClient(baseUrl))
  }

  const authSystem = new UserSystem(userProvider)
  return authSystem

}
