
import UserSessionCrudPage from "../pages/crud/UserSessionCrudPage.vue";


const UserSessionCrudRoute = [
  {
    name: 'UserSessionCrudPage',
    path: '/identity/user-session',
    component: UserSessionCrudPage,
    meta: {
      auth: true,
      permission: 'usersession:manage',
    }
  },
]

export default UserSessionCrudRoute
export { UserSessionCrudRoute }
