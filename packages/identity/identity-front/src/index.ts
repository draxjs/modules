import IdentityLogin from "./components/IdentityLogin/IdentityLogin.vue";
import AuthSystem from "./core/system/AuthSystem"
import AuthRestProvider from "./core/providers/rest/AuthRestProvider";
import AuthGqlProvider from "./core/providers/gql/AuthGqlProvider";
import {useAuthStore} from "./stores/auth/AuthStore";

export {
    //Vue Components
    IdentityLogin,

    //Providers
    AuthRestProvider,
    AuthGqlProvider,

    //Systems
    AuthSystem,

    //Stores
    useAuthStore
}
