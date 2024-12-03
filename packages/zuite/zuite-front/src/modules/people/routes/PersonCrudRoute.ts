
import PersonCrudPage from "../pages/crud/PersonCrudPage.vue";


const PersonCrudRoute = [
  {
    name: 'PersonCrudPage',
    path: '/crud/person',
    component: PersonCrudPage,
    meta: {
      auth: true,
      permission: 'person:manage',
    }
  },
]

export default PersonCrudRoute
export { PersonCrudRoute }
