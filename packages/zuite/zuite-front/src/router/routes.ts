import baseRoutes from '../modules/base/routes/index'
import peopleRoutes from '../modules/people/routes/index'
import {IdentityRoutes} from "@drax/identity-vue";

const routes = [
  ...IdentityRoutes,
  ...baseRoutes,
  ...peopleRoutes
]

export default routes
