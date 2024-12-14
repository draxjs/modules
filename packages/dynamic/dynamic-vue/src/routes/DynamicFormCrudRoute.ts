
import DynamicFormCrudPage from "../pages/crud/DynamicFormCrudPage.vue";


const DynamicFormCrudRoute = [
  {
    name: 'DynamicFormCrudPage',
    path: '/crud/dynamicform',
    component: DynamicFormCrudPage,
    meta: {
      auth: true,
      permission: 'dynamicform:manage',
    }
  },
]

export default DynamicFormCrudRoute
export { DynamicFormCrudRoute }
