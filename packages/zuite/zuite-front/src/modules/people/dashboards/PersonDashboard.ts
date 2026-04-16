import type {IDashboardBase} from "@drax/dashboard-share";
import PersonCrud from "../cruds/PersonCrud";

function createPersonDashboard(): IDashboardBase {
  return {
    identifier: "person",
    title: "Person Dashboard",
    cards: [
      {
        entity: "Person",
        type: "groupBy",
        entityInstance: PersonCrud.instance,
        title: "Barrita",
        layout: {
          cols: 12,
          sm: 12,
          md: 4,
          lg: 4,
          cardVariant: "outlined",
          height: 400
        },
        filters: [],
        groupBy: {
          fields: ["birthdate","race"],
          dateFormat: "month",
          render: "bars"
        }
      },
      {
        entity: "Person",
        type: "groupBy",
        entityInstance: PersonCrud.instance,
        title: "Barrita",
        layout: {
          cols: 12,
          sm: 12,
          md: 4,
          lg: 4,
          cardVariant: "outlined",
          height: 400
        },
        filters: [],
        groupBy: {
          fields: ["birthdate","race"],
          dateFormat: "month",
          render: "pie"
        }
      },
      {
        entity: "Person",
        type: "groupBy",
        entityInstance: PersonCrud.instance,
        title: "Lines",
        layout: {
          cols: 12,
          sm: 12,
          md: 4,
          lg: 4,
          cardVariant: "outlined",
          height: 400
        },
        filters: [],
        groupBy: {
          fields: ["birthdate","race", "live"],
          dateFormat: "year",
          render: "table"
        }
      },
      {
        entity: "Person",
        type: "groupBy",
        entityInstance: PersonCrud.instance,
        title: "Address combined 1",
        layout: {
          cols: 12,
          sm: 12,
          md: 4,
          lg: 4,
          cardVariant: "outlined",
          height: 400
        },
        filters: [{field: 'address.country', operator: 'in', value: ['Argentina','Brasil']}],
        groupBy: {
          fields: ["address.country", "address.city"],
          render: "table"
        }
      },
      {
        entity: "Person",
        type: "groupBy",
        entityInstance: PersonCrud.instance,
        title: "Address combined 2",
        layout: {
          cols: 12,
          sm: 12,
          md: 4,
          lg: 4,
          cardVariant: "outlined",
          height: 400
        },
        filters: [{field: 'address.zip', operator: 'in', value: [123,321]}],
        groupBy: {
          fields: ["address.country", "address.city"],
          render: "table"
        }
      },
      {
        entity: "Person",
        type: "groupBy",
        entityInstance: PersonCrud.instance,
        title: "Address combined 3",
        layout: {
          cols: 12,
          sm: 12,
          md: 4,
          lg: 4,
          cardVariant: "outlined",
          height: 400
        },
        filters: [{field: 'address.zip', operator: 'eq', value: 123}],
        groupBy: {
          fields: ["address.country", "address.city"],
          render: "table"
        }
      },
      {
        entity: "Person",
        type: "groupBy",
        entityInstance: PersonCrud.instance,
        title: "Address Country",
        filters: [],
        layout: {
          cols: 12,
          sm: 12,
          md: 4,
          lg: 4,
          cardVariant: "outlined",
          height: 400
        },
        groupBy: {
          fields: ["address.country"],
          render: "table"
        }
      },
      {
        entity: "Person",
        type: "groupBy",
        entityInstance: PersonCrud.instance,
        title: "Address City",
        filters: [],
        layout: {
          cols: 12,
          sm: 12,
          md: 4,
          lg: 4,
          cardVariant: "outlined",
          height: 400
        },
        groupBy: {
          fields: ["address.city"],
          render: "table"
        }
      },
      {
        entity: "Person",
        type: "paginate",
        entityInstance: PersonCrud.instance,
        title: "Latest People",
        filters: [],
        layout: {
          cols: 12,
          sm: 12,
          md: 12,
          lg: 12,
          cardVariant: "outlined",
          height: 420
        },
        paginate: {
          columns: ["fullname", "live", "money", "birthdate", "race"],
          orderBy: "createdAt",
          order: "desc"
        }
      },

      {
        entity: "Person",
        type: "groupBy",
        entityInstance: PersonCrud.instance,
        title: "Race Distribution",
        filters: [],
        layout: {
          cols: 12,
          sm: 12,
          md: 4,
          lg: 4,
          cardVariant: "outlined",
          height: 400
        },
        groupBy: {
          fields: ["race"],
          render: "pie"
        }
      },
      {
        entity: "Person",
        type: "groupBy",
        entityInstance: PersonCrud.instance,
        title: "Birthdate By Month",
        filters: [],
        layout: {
          cols: 12,
          sm: 12,
          md: 4,
          lg: 4,
          cardVariant: "outlined",
          height: 400
        },
        groupBy: {
          fields: ["birthdate"],
          dateFormat: "month",
          render: "bars"
        }
      }
    ]
  }
}

export {createPersonDashboard}
export default createPersonDashboard
