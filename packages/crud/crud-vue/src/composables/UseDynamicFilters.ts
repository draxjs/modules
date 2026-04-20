import {computed} from "vue"
import type {Ref} from "vue"
import {useI18n} from "vue-i18n"
import type {
    IEntityCrudField,
    IEntityCrudFilter,
    IEntityCrudFieldTypes
} from "@drax/crud-share"

export function useDynamicFilters(
    entityName: Ref<string | undefined>,
    entityFields: Ref<any[]>,
    filters: Ref<IEntityCrudFilter[]>
) {

    const {t, te} = useI18n()

    const dynamicFilter = computed(() => {
        return (index: number) => filters.value[index]
    })

    const fieldI18n = computed(() => {
        return (field: Pick<IEntityCrudField, 'name' | 'label'>, fieldName = field.name) => {
            const key = entityName.value?.toLowerCase() + ".field." + fieldName
            return te(key) ? t(key) : field.label
        }
    })

    function flattenFilterableFields(
        fields: IEntityCrudField[],
        parentPath = '',
        parentLabels: string[] = []
    ): IEntityCrudField[] {
        return fields.flatMap((field) => {
            if (field.type === 'fullFile' || field.type === 'array.object') {
                return []
            }

            const fieldPath = parentPath ? `${parentPath}.${field.name}` : field.name
            const fieldLabel = fieldI18n.value(field, fieldPath)
            const pathLabels = [...parentLabels, fieldLabel]

            if (field.type === 'object') {
                if (!field.objectFields?.length) {
                    return []
                }

                return flattenFilterableFields(field.objectFields, fieldPath, pathLabels)
            }

            return [{
                ...field,
                name: fieldPath,
                label: pathLabels.join(' / ')
            }]
        })
    }

    const filterableFields = computed(() => {
        return flattenFilterableFields(entityFields.value || [])
    })

    const selectableFields = computed(() => {
        return filterableFields.value
            .map((f: IEntityCrudField) => ({
                title: fieldI18n.value(f),
                value: f.name
            })) || []
    })

    const fieldByName = computed(() => {
        return new Map(
            filterableFields.value.map((field) => [field.name, field] as const)
        )
    })

    function normalizeFieldType(type: string): IEntityCrudFieldTypes {
        if (type === 'array.ref') return 'ref'
        if (type === 'array.string') return 'string'
        if (type === 'longString') return 'string'
        if (type === 'array.number') return 'number'
        if (type === 'array.enum') return 'enum'
        return type as IEntityCrudFieldTypes
    }

    function onUpdateField(index: number, resetOperator = false) {

        const filter = filters.value[index]
        if (!filter) return

        if(resetOperator){
            filter.operator = 'eq'
        }

        const field = fieldByName.value.get(filter.name)

        filter.value = null
        if (!field) return

        if (field.ref) filter.ref = field.ref
        if (field.refDisplay) filter.refDisplay = field.refDisplay
        if (field.enum) filter.enum = field.enum

        if (field.type) {

            filter.type = normalizeFieldType(field.type)

            //aplico default false si type es boolean
            if (field.type === "boolean") {
                filter.value = false
            }

        }

        //Convierto a multiple si operadores son in o nin
        if (filter.operator && ['in','nin'].includes(filter.operator)) {

            if (['ref', 'array.ref'].includes(field.type)) {
                filter.type = 'array.ref'
            }

            if (['string', 'longString', 'array.string'].includes(field.type)) {
                filter.type = 'array.string'
            }

            if (['enum', 'array.enum'].includes(field.type)) {
                filter.type = 'array.enum'
            }

        }
    }

    function addFilter() {
        const filter: IEntityCrudFilter = {
            default: undefined,
            label: "",
            name: "",
            operator: "eq",
            type: "string",
            permission: "",
            value: ""
        }

        filters.value.push(filter)
    }

    function removeFilter(index: number) {
        filters.value.splice(index, 1)
    }

    const operations = [
        {title: t('operation.equals'), value: 'eq'},
        {title: t('operation.contains'), value: 'like'},
        {title: t('operation.empty'), value: 'empty'},
        {title: t('operation.notEquals'), value: 'ne'},
        {title: t('operation.greaterThan'), value: 'gt'},
        {title: t('operation.lessThan'), value: 'lt'},
        {title: t('operation.greaterThanOrEqual'), value: 'gte'},
        {title: t('operation.lessThanOrEqual'), value: 'lte'},
        {title: t('operation.in'), value: 'in'},
        {title: t('operation.notIn'), value: 'nin'},
    ]

    const getOperations = computed(() => {
        return (index: number) => {

            const filter = filters.value[index]
            if (!filter || !filter.type) return []

            return operations.filter(op => {
                if (['ref','array.ref'].includes(filter.type) && ['gt', 'gte', 'lt', 'lte', 'like'].includes(op.value)) {
                    return false
                }
                if (['date'].includes(filter.type) && ['in', 'nin', 'like'].includes(op.value)) {
                    return false
                }
                return true
            })
        }
    })

    const isValueRequired = computed(() => {
        return (index: number) => {
            const filter = filters.value[index]
            if (!filter || !filter.operator){
                return false
            }
            if (['empty'].includes(filter.operator)) {
                return false
            }
            return true
        }
    })


    return {
        dynamicFilter,
        selectableFields,
        fieldI18n,
        operations,
        getOperations,
        isValueRequired,
        addFilter,
        removeFilter,
        onUpdateField,
        normalizeFieldType
    }
}
