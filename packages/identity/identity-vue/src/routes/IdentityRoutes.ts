import IdentityCrudRoutes from './IdentityCrudRoutes'
import IdentityAuthRoutes from './IdentityAuthRoutes'
import UserLoginFailCrudRoute from './UserLoginFailCrudRoute'
import UserSessionCrudRoute from './UserSessionCrudRoute'


const routes = [
    ...IdentityAuthRoutes,
    ...IdentityCrudRoutes,
    ...UserLoginFailCrudRoute,
    ...UserSessionCrudRoute
]


export default routes
