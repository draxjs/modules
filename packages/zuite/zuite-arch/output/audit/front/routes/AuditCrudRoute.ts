
import AuditCrudPage from "../pages/crud/AuditCrudPage.vue";


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
]

export default AuditCrudRoute
export { AuditCrudRoute }
