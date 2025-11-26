
import DashboardCrudPage from "../pages/crud/DashboardCrudPage.vue";
import DashboardViewPage from "../pages/DashboardViewPage.vue";
import DashboardIdentifierPage from "../pages/DashboardIdentifierPage.vue";


const DashboardCrudRoute = [
  {
    name: 'DashboardCrudPage',
    path: '/crud/dashboard',
    component: DashboardCrudPage,
    meta: {
      auth: true,
      permission: 'dashboard:manage',
    }
  },
  {
    name: 'DashboardPage',
    path: '/dashboard/view',
    component: DashboardViewPage,
    meta: {
      auth: true,
      permission: 'dashboard:manage',
    }
  },
  {
    name: 'DashboardIdentifierPage',
    path: '/dashboard/identifier/:identifier',
    component: DashboardIdentifierPage,
    meta: {
      auth: true,
      permission: 'dashboard:manage',
    }
  },
]

export default DashboardCrudRoute
export { DashboardCrudRoute }
