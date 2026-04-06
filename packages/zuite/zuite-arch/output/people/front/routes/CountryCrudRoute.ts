
import CountryCrudPage from "../pages/crud/CountryCrudPage.vue";


const CountryCrudRoute = [
  {
    name: 'CountryCrudPage',
    path: '/crud/country',
    component: CountryCrudPage,
    meta: {
      auth: true,
      permission: 'country:manage',
    }
  },
]

export default CountryCrudRoute
export { CountryCrudRoute }
