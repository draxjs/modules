
import DraxAgentPage from "../pages/DraxAgentPage.vue";


const AILogCrudRoute = [
  {
    name: 'DraxAgentPage',
    path: '/drax-agent',
    component: DraxAgentPage,
    meta: {
      auth: true,
      permission: 'ailog:manage',
    }
  },
]

export default AILogCrudRoute
export { AILogCrudRoute }
