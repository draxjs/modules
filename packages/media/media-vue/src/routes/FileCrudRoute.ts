
import FileCrudPage from "../pages/crud/FileCrudPage.vue";


const FileCrudRoute = [
  {
    name: 'FileCrudPage',
    path: '/crud/file',
    component: FileCrudPage,
    meta: {
      auth: true,
      permission: 'file:manage',
    }
  },
]

export default FileCrudRoute
export { FileCrudRoute }
