import {useI18n} from "vue-i18n";

export function useI18nValidation() {
    const {t} = useI18n()

    function $ta(inputError: string[] | undefined): string | undefined {
        return inputError ? inputError.map(error => t(error)).join(", ") : undefined
    }

    return {$ta}
}
