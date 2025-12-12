
import DashboardCrudPage from "../pages/crud/DashboardCrudPage.vue";


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
]

export default DashboardCrudRoute
export { DashboardCrudRoute }
