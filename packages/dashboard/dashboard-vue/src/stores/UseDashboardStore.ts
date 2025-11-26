import {defineStore} from "pinia";
import type { IEntityCrud} from "@drax/crud-share";

export const useDashboardStore = defineStore('DashboardStore', {
    state: () => (
        {
            entities: [] as IEntityCrud[],

        }
    ),
    getters: {
        getEntities(state: any) {
                return state.entities
        }
    },
    actions: {
        setEntities(entities: IEntityCrud) {
            this.entities = entities
        },
        addEntity(entity: IEntityCrud) {
            this.entities.push(entity)
        }
    }

})
