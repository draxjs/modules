import baseRoutes from '../modules/base/routes/index'
import peopleRoutes from '../modules/people/routes/index'
import {IdentityRoutes} from "@drax/identity-vue";
import {DynamicFormCrudRoute} from "@drax/dynamic-vue";

const routes = [
  ...IdentityRoutes,
  ...baseRoutes,
  ...peopleRoutes,
  ...DynamicFormCrudRoute
]

export default routes
