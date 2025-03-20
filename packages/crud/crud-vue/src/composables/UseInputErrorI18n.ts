import {useCrudStore} from "../stores/UseCrudStore";
import {useI18n} from "vue-i18n";
import {computed} from "vue";

export function useInputErrorI18n() {

    const store = useCrudStore()

    const {t, te} = useI18n()

    const inputErrorsI18n = computed(() => {
            return (name:string) => {
                return store.getInputErrors(name).map((error: string) => te(error) ? t(error) : error)
            }
        }
    )

    return {inputErrorsI18n}
}
