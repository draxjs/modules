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
            title: "Entity Action",
            filters: [],
            layout:{
                cols: 12, sm: 12, md: 6, lg: 6, cardVariant: "outlined", height: 400
            },
            groupBy: {
                fields: ["entity", "action"],
                dateFormat: "day",
                render: "table"
            }
        },
        {
            entity: 'Audit',
            type: "groupBy",
            entityInstance: AuditCrud.instance,
            title: "User Action",
            filters: [],
            layout:{
                cols: 12, sm: 12, md: 6, lg: 6, cardVariant: "outlined", height: 400
            },
            groupBy: {
                fields: ["user", "action"],
                dateFormat: "day",
                render: "table"
            }
        },
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
        }
    ]
}

export {auditDashboard}
export default auditDashboard;
