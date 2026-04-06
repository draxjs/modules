
import LanguageCrudPage from "../pages/crud/LanguageCrudPage.vue";


const LanguageCrudRoute = [
  {
    name: 'LanguageCrudPage',
    path: '/crud/language',
    component: LanguageCrudPage,
    meta: {
      auth: true,
      permission: 'language:manage',
    }
  },
]

export default LanguageCrudRoute
export { LanguageCrudRoute }
