
import DraxAgentPage from "../pages/DraxAgentPage.vue";
import DraxAgentExpressPage from "../pages/DraxAgentExpressPage.vue";


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
  {
    name: 'DraxAgentExpressPage',
    path: '/drax-agent-express',
    component: DraxAgentExpressPage,
    meta: {
      auth: true,
      permission: 'ailog:manage',
    }
  },
]

export default AILogCrudRoute
export { AILogCrudRoute }
