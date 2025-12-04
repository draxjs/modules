
import AuditCrudPage from "../pages/crud/AuditCrudPage.vue";
import AuditCrudDashboardPage from "../pages/crud/AuditCrudDashboardPage.vue";


const AuditCrudRoute = [
  {
    name: 'AuditCrudPage',
    path: '/crud/audit',
    component: AuditCrudPage,
    meta: {
      auth: true,
      permission: 'audit:manage',
    }
  },
  {
    name: 'AuditCrudDashboardPage',
    path: '/crud/audit-ds',
    component: AuditCrudDashboardPage,
    meta: {
      auth: true,
      permission: 'audit:manage',
    }
  },
]

export default AuditCrudRoute
export { AuditCrudRoute }
