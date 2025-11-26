import { computed } from 'vue'
import type {IEntityCrud, IEntityCrudField, IDraxGroupByDateFormat} from "@drax/crud-share"
import { useI18n } from "vue-i18n"
import { useGroupByStore } from '../stores/UseGroupByStore'
import {useCrudStore} from '../stores/UseCrudStore'


export const useCrudGroupBy = (entity: IEntityCrud) => {
  const { t, te } = useI18n()
  const groupBystore = useGroupByStore()
  const crudStore = useCrudStore()
  const entityName = entity.name.toLowerCase()

  const availableFields = computed<IEntityCrudField[]>(() => {
    return entity.fields
        .filter(field => {
          // Excluir campos que no son apropiados para agrupar
          const excludedTypes = ['password', 'longString', 'array.string','array.number','array.ref','array.object', 'object', 'file', 'fullFile']
          return !excludedTypes.includes(field.type)
        }).map(field => ({...field, label: te(`${entityName}.field.${field?.name}`) ? t(`${entityName}.field.${field?.name}`) : field?.label}))
  })

  const handleGroupBy = async (callback: (fields: string[]) => void | Promise<void>) => {
    if (groupBystore.selectedFields.length === 0) return


    groupBystore.setLoading(true)
    try {
      if(entity?.provider?.groupBy){
        const data = await entity.provider.groupBy({
          fields: groupBystore.selectedFields.map(sf => sf.name),
          filters: crudStore.filters
        })
        groupBystore.setGroupByData(data)
      }
    } finally {
      groupBystore.setLoading(false)
    }
  }

  // Verificar si hay campos de tipo fecha seleccionados
  const hasDateFields = computed(() => {
    return groupBystore.selectedFields.some(field => {
      return field?.type === 'date'
    })
  })

  // Opciones de formato de fecha
  const dateFormatOptions = computed(() => [
    { value: 'year', title: t('crud.groupBy.dateFormat.year') },
    { value: 'month', title: t('crud.groupBy.dateFormat.month') },
    { value: 'day', title: t('crud.groupBy.dateFormat.day') },
    { value: 'hour', title: t('crud.groupBy.dateFormat.hour') },
    { value: 'minute', title: t('crud.groupBy.dateFormat.minute') },
    { value: 'second', title: t('crud.groupBy.dateFormat.second') }
  ])



  return {
    // Store state
    dialog: computed(() => groupBystore.dialog),
    selectedFields: computed({
      get: () => groupBystore.selectedFields,
      set: (value: IEntityCrudField[]) => {
        groupBystore.clearGroupByData()
        groupBystore.setSelectedFields(value)
      }
    }),
    groupByData: computed(() => groupBystore.groupByData),
    loading: computed(() => groupBystore.loading),
    // Computed
    availableFields,
    // Methods
    openDialog: groupBystore.openDialog,
    closeDialog: groupBystore.closeDialog,
    resetAndClose: groupBystore.resetAndClose,
    clearGroupByData: groupBystore.clearGroupByData,
    handleGroupBy,

    dateFormat: computed({
      get: () => groupBystore.dateFormat,
      set: (value: IDraxGroupByDateFormat) => {
        groupBystore.clearGroupByData()
        groupBystore.setDateFormat(value)
      }
    }),
    hasDateFields,
    dateFormatOptions,
  }
}
