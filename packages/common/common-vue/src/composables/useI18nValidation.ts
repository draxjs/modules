import {useI18n} from "vue-i18n";

export function useI18nValidation() {
    const {t,te} = useI18n()

    function $ta(inputError: string[] | undefined): string | undefined {
        return inputError ? inputError.map(error => te(error) ?t(error) : error).join(", ") : undefined
    }

    return {$ta}
}
