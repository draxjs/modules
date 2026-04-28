
import CovenantCrudPage from "../pages/crud/CovenantCrudPage.vue";


const CovenantCrudRoute = [
  {
    name: 'CovenantCrudPage',
    path: '/crud/covenant',
    component: CovenantCrudPage,
    meta: {
      auth: true,
      permission: 'covenant:manage',
    }
  },
]

export default CovenantCrudRoute
export { CovenantCrudRoute }
