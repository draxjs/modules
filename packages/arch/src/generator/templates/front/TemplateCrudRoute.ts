import {IEntitySchema} from "../../../interfaces/IEntitySchema";

export const TemplateCrudRoute = (entity: IEntitySchema) => `
import ${entity.name}CrudPage from "../pages/${entity.name}CrudPage.vue";


const ${entity.name}CrudRoute = [
  {
    name: '${entity.name}CrudPage',
    path: '/crud/${entity.name.toLowerCase()}',
    component: ${entity.name}CrudPage,
    meta: {
      auth: true,
      permission: '${entity.name.toLowerCase()}:manage',
    }
  },
]

export default ${entity.name}CrudRoute
export { ${entity.name}CrudRoute }
`
