import type {IEntityCrudOperation} from "@drax/crud-share";
import {computed} from "vue";


export function useFormUtils(operation:IEntityCrudOperation) {

    const readonly = computed(() => {
        return operation === 'delete' || operation === 'view';
    })

    const submitColor = computed(() => {
        if(operation === 'create') {
            return 'primary'
        }else if(operation === 'edit') {
            return 'primary'
        }else if(operation === 'delete') {
            return 'red'
        }else if(operation === 'view') {
            return 'secondary'
        }
    })

    const variant = computed(() => {
        if(operation === 'create') {
            return 'filled'
        }else if(operation === 'edit') {
            return 'filled'
        }else if(operation === 'delete') {
            return 'underlined'
        }else if(operation === 'view') {
            return 'underlined'
        }
    })



    return {
        readonly,
        variant,
        submitColor,
    }
}
