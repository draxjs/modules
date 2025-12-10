import {defineStore} from "pinia";
import type { IDashboardBase} from "@drax/dashboard-share";

export const useDashboardStore = defineStore('DashboardStore', {
    state: () => (
        {
            dashboards: [] as IDashboardBase[],

        }
    ),
    getters: {
        getDashboards(state: any) {
                return state.dashboards
        }
    },
    actions: {
        setDashboards(dashboards: IDashboardBase[]) {
            this.dashboards = dashboards
        },
        addEntity(dashboard: IDashboardBase) {
            this.dashboards.push(dashboard)
        }
    }

})
