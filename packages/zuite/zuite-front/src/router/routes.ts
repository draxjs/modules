import baseRoutes from '../modules/base/routes/index'
import peopleRoutes from '../modules/people/routes/index'
import {IdentityRoutes} from "@drax/identity-vue";
import {SettingRoutes} from "@drax/settings-vue";
import {DynamicFormCrudRoute} from "@drax/dynamic-vue";
import {DashboardCrudRoute} from "@drax/dashboard-vue";
import {AuditRoutes} from "@drax/audit-vue";

const routes = [
  ...baseRoutes,
  ...IdentityRoutes,
  ...SettingRoutes,
  ...peopleRoutes,
  ...DynamicFormCrudRoute,
  ...DashboardCrudRoute,
  ...AuditRoutes
]

export default routes
