import {AuthRestProvider, AuthSystem, useAuthStore} from "@drax/identity-front";
import {HttpFetchClient} from "@drax/common-front";

export const authSystemFactory = () => {
  const {setAuthSystem} = useAuthStore()
  const baseUrl = ''
  const baseHeaders =  {'content-type': 'application/json'}
  const authRestProvider = new AuthRestProvider(new HttpFetchClient(baseUrl, baseHeaders))
  const authSystem = new AuthSystem(authRestProvider)
  setAuthSystem(authSystem)
}
