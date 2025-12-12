
import UserSessionCrudPage from "../pages/crud/UserSessionCrudPage.vue";


const UserSessionCrudRoute = [
  {
    name: 'UserSessionCrudPage',
    path: '/crud/usersession',
    component: UserSessionCrudPage,
    meta: {
      auth: true,
      permission: 'usersession:manage',
    }
  },
]

export default UserSessionCrudRoute
export { UserSessionCrudRoute }
