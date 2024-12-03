import {HttpClientFactory} from "@drax/common-front"

function setupAuth(){
  let accessToken:string|null = null
  const authStoreString = localStorage.getItem("AuthStore");
  if (authStoreString) {
    const authStoreObject = JSON.parse(authStoreString);
    accessToken = authStoreObject.accessToken;
    if(accessToken){
      HttpClientFactory.getInstance().addHeader('Authorization', `Bearer ${accessToken}`)
    }
  }
}


export {setupAuth}
