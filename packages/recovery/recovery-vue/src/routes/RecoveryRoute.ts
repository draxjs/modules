import RecoveryPage from "../pages/RecoveryPage.vue";

const RecoveryRoute = [
  {
    name: "RecoveryPage",
    path: "/recovery",
    component: RecoveryPage,
    meta: {
      auth: true,
    }
  },
];

export default RecoveryRoute;
export {RecoveryRoute};
