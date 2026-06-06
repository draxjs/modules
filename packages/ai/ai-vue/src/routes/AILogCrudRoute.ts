
import AILogCrudPage from "../pages/crud/AILogCrudPage.vue";
import DraxAILogDashboardPage from "../pages/DraxAILogDashboardPage.vue";


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
  {
    name: 'DraxAILogDashboardPage',
    path: '/ailog/dashboard',
    component: DraxAILogDashboardPage,
    meta: {
      auth: true,
      permission: 'ailog:manage',
    }
  },
]

export default AILogCrudRoute
export { AILogCrudRoute }
