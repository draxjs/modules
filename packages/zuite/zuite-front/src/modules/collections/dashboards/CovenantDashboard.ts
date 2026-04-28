import type {IDashboardBase} from "@drax/dashboard-share";
import CovenantCrud from "../cruds/CovenantCrud";

type DashboardFilter = {
  field: string
  operator: string
  value: unknown
}

function createCovenantDashboard(filters: DashboardFilter[] = []): IDashboardBase {
  return {
    identifier: "covenant-dashboard",
    title: "Dashboard de Convenios",
    cards: [
      {
        entity: "Covenant",
        entityInstance: CovenantCrud.instance,
        type: "groupBy",
        title: "Resumen por zona",
        filters,
        layout: {
          cols: 12,
          sm: 12,
          md: 6,
          lg: 6,
          height: 420,
          cardVariant: "outlined",
        },
        groupBy: {
          fields: ["group", "amount"],
          render: "table",
        },
      },
      {
        entity: "Covenant",
        entityInstance: CovenantCrud.instance,
        type: "groupBy",
        title: "Resumen por usuario",
        filters,
        layout: {
          cols: 12,
          sm: 12,
          md: 6,
          lg: 6,
          height: 420,
          cardVariant: "outlined",
        },
        groupBy: {
          fields: ["createdBy", "amount"],
          render: "table",
        },
      },
    ],
  };
}

export {createCovenantDashboard};
export default createCovenantDashboard;
