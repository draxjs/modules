
import UserLoginFailCrudPage from "../pages/crud/UserLoginFailCrudPage.vue";


const UserLoginFailCrudRoute = [
  {
    name: 'UserLoginFailCrudPage',
    path: '/identity/user-login-fail',
    component: UserLoginFailCrudPage,
    meta: {
      auth: true,
      permission: 'userloginfail:manage',
    }
  },
]

export default UserLoginFailCrudRoute
export { UserLoginFailCrudRoute }
