import ConvenantDashboardPage from "../pages/ConvenantDashboardPage.vue";
import CovenantExportPage from "../pages/CovenantExportPage.vue";

const CovenantRoutes = [
  {
    name: "CovenantDashboardPage",
    path: "/dashboard/covenant",
    component: ConvenantDashboardPage,
    meta: {
      auth: true,
      permission: "covenant:view",
    },
  },
  {
    name: "CovenantExportPage",
    path: "/export/covenant",
    component: CovenantExportPage,
    meta: {
      auth: true,
      permission: "covenant:manage",
    },
  },
];

export default CovenantRoutes;
export {CovenantRoutes};
