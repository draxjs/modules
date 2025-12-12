import {defineStore} from "pinia";
import type { IEntityCrud} from "@drax/crud-share";

export const useEntityStore = defineStore('EntityStore', {
    state: () => (
        {
            entities: [] as IEntityCrud[],

        }
    ),
    getters: {
        getEntities(state: any) {
                return state.entities
        },
        hasEntity(state: any) {
            return (name: string) => state.entities.some((entity: IEntityCrud) => entity.name === name)
        },
        getEntity(state: any) {
            return (name: string) => state.entities.find((entity: IEntityCrud) => entity.name === name)
        }
    },
    actions: {
        setEntities(entities: IEntityCrud[]) {
            this.entities = entities
        },
        addEntity(entity: IEntityCrud) {
            this.entities.push(entity)
        }
    }

})
