import IdentityCrudRoutes from './IdentityCrudRoutes'
import IdentityAuthRoutes from './IdentityAuthRoutes'


const routes = [
    ...IdentityAuthRoutes,
    ...IdentityCrudRoutes,
]


export default routes
