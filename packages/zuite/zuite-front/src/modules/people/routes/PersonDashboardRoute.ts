import PersonDashboardPage from "../pages/PersonDashboardPage.vue";

const PersonDashboardRoute = [
  {
    name: "PersonDashboardPage",
    path: "/crud/person-ds",
    component: PersonDashboardPage,
    meta: {
      auth: true,
      permission: "person:manage",
    }
  },
]

export default PersonDashboardRoute
export {PersonDashboardRoute}
