import type {IDashboardBase} from "@drax/dashboard-share";
import AuditCrud from "../cruds/AuditCrud";

const auditDashboard: IDashboardBase = {
    identifier: "audit",
    title: "Audit Dashboard",
    cards: [
        {
            entity: 'Audit',
            type: "groupBy",
            entityInstance: AuditCrud.instance,
            title: "User Entity Action",
            filters: [],
            layout:{
                cols: 12, sm: 12, md: 12, lg: 12, cardVariant: "outlined", height: 400
            },
            groupBy: {
                fields: ["user", "entity", "action"],
                dateFormat: "day",
                render: "table"
            }
        },
        {
            entity: 'Audit',
            type: "groupBy",
            entityInstance: AuditCrud.instance,
            title: "User Audits",
            filters: [],
            layout:{
                cols: 12, sm: 12, md: 4, lg: 4, cardVariant: "outlined", height: 400
            },
            groupBy: {
                fields: ["user"],
                dateFormat: "day",
                render: "pie"
            }
        },
        {
            entity: 'Audit',
            type: "groupBy",
            entityInstance: AuditCrud.instance,
            title: "Entity Audits",
            filters: [],
            layout:{
                cols: 12, sm: 12, md: 4, lg: 4, cardVariant: "outlined", height: 400
            },
            groupBy: {
                fields: ["entity"],
                dateFormat: "day",
                render: "pie"
            }
        },
        {
            entity: 'Audit',
            type: "groupBy",
            entityInstance: AuditCrud.instance,
            title: "Action Audits",
            filters: [],
            layout:{
                cols: 12, sm: 12, md: 4, lg: 4, cardVariant: "outlined", height: 400
            },
            groupBy: {
                fields: ["action"],
                dateFormat: "day",
                render: "pie"
            }
        },

    ]
}

export {auditDashboard}
export default auditDashboard;
