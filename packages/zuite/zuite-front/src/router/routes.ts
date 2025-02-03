import baseRoutes from '../modules/base/routes/index'
import peopleRoutes from '../modules/people/routes/index'
import {IdentityRoutes} from "@drax/identity-vue";
import {SettingRoutes} from "@drax/settings-vue";
import {DynamicFormCrudRoute} from "@drax/dynamic-vue";

const routes = [
  ...baseRoutes,
  ...IdentityRoutes,
  ...SettingRoutes,
  ...peopleRoutes,
  ...DynamicFormCrudRoute
]

export default routes
