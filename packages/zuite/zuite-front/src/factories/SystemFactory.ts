import {UserGqlProvider, UserRestProvider, UserSystem, IUserProvider} from "@drax/identity-front";
import {RoleGqlProvider, RoleRestProvider, RoleSystem, IRoleProvider} from "@drax/identity-front";
import {AuthGqlProvider, AuthRestProvider, AuthSystem, IAuthProvider} from "@drax/identity-front";
import {HttpGqlClient, HttpRestClient} from "@drax/common-front";

// import {useAuthStore} from "@drax/identity-vue";
// const authStore = useAuthStore()

const REST = 'REST'
const GRAPHQL = 'GRAPHQL'
const CLIENTS = [REST, GRAPHQL]

export function SystemFactory(HttpClientType: string = REST) {

  if (!CLIENTS.includes(HttpClientType)) {
    throw new Error(`HttpClient must be one of ${CLIENTS}`)
  }

  const baseUrl: string = ''
  let userProvider: IUserProvider
  let roleProvider: IRoleProvider
  let authProvider: IAuthProvider
  let HttpClient



  if (HttpClientType === GRAPHQL) {
    HttpClient = new HttpGqlClient('/graphql')
    userProvider = new UserGqlProvider(HttpClient)
    roleProvider = new RoleGqlProvider(HttpClient)
    authProvider = new AuthGqlProvider(HttpClient)
  } else {
    HttpClient = new HttpRestClient(baseUrl)
    userProvider = new UserRestProvider(HttpClient)
    roleProvider = new RoleRestProvider(HttpClient)
    authProvider = new AuthRestProvider(HttpClient)
  }

  //AccessToken on start from authStore
  /*
  if (authStore.accessToken) {
    HttpClient.addHeader('Authorization', `Bearer ${authStore.accessToken}`)
  }
  */

  //AccessToken on start directly from local storage

  let accessToken:string|null = null
  const authStoreString = localStorage.getItem("AuthStore");
  if (authStoreString) {
    const authStoreObject = JSON.parse(authStoreString);
    accessToken = authStoreObject.accessToken;
    if(accessToken){
      HttpClient.addHeader('Authorization', `Bearer ${accessToken}`)
    }
  }

  const userSystem = new UserSystem(userProvider)
  const roleSystem = new RoleSystem(roleProvider)
  const authSystem = new AuthSystem(authProvider)
  return {userSystem, roleSystem, authSystem, HttpClient}

}
