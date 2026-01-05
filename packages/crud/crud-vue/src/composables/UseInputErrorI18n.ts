import {useCrudStore} from "../stores/UseCrudStore";
import {useI18n} from "vue-i18n";
import {computed} from "vue";
import type {IEntityCrud} from "@drax/crud-share";

export function useInputErrorI18n(entity: IEntityCrud) {

    const store = useCrudStore(entity?.name)

    const {t, te} = useI18n()

    const inputErrorsI18n = computed(() => {
            return (name:string) => {
                return store.getFieldInputErrors(name).map((error: string) => te(error) ? t(error) : error)
            }
        }
    )

    return {inputErrorsI18n}
}
