
import AILogCrudPage from "../pages/crud/AILogCrudPage.vue";


const AILogCrudRoute = [
  {
    name: 'AILogCrudPage',
    path: '/crud/ailog',
    component: AILogCrudPage,
    meta: {
      auth: true,
      permission: 'ailog:manage',
    }
  },
]

export default AILogCrudRoute
export { AILogCrudRoute }
