
import LanguageCrudPage from "../pages/LanguageCrudPage.vue";


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
