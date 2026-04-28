
import GroupZoneCrudPage from "../pages/crud/GroupZoneCrudPage.vue";


const GroupZoneCrudRoute = [
  {
    name: 'GroupZoneCrudPage',
    path: '/crud/groupzone',
    component: GroupZoneCrudPage,
    meta: {
      auth: true,
      permission: 'groupzone:manage',
    }
  },
]

export default GroupZoneCrudRoute
export { GroupZoneCrudRoute }
