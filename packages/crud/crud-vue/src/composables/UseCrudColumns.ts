
import { computed } from 'vue'
import type { IEntityCrud, IEntityCrudHeader } from '@drax/crud-share'
import { useAuth } from '@drax/identity-vue'
import { useI18n } from 'vue-i18n'
import { useCrudStore } from '../stores/UseCrudStore'

export function useCrudColumns(entity: IEntityCrud) {
  const { hasPermission } = useAuth()
  const { t, te } = useI18n()
  const crudStore = useCrudStore()

  // Inicializar columnas visibles si no existen en el store
  const initializeVisibleColumns = () => {
    if (crudStore.visibleColumns.length === 0) {
      const availableHeaders = entity.headers
        .filter(header => !header.permission || hasPermission(header.permission))
        .map(header => header.key)

      const initialColumns = entity.selectedHeaders?.filter(key => 
        availableHeaders.includes(key)
      ) || availableHeaders

      crudStore.setVisibleColumns(initialColumns)
    }
  }

  // Inicializar al crear el composable
  initializeVisibleColumns()

  // Obtener columnas visibles del store
  const visibleColumns = computed(() => crudStore.visibleColumns)

  // Headers traducidos y filtrados por permisos
  const translatedHeaders = computed<IEntityCrudHeader[]>(() => {
    return entity.headers
      .filter(header => !header.permission || hasPermission(header.permission))
      .map(header => ({
        ...header,
        title: te(`${entity.name.toLowerCase()}.field.${header.title}`) 
          ? t(`${entity.name.toLowerCase()}.field.${header.title}`) 
          : header.title
      }))
  })

  // Headers filtrados por columnas visibles
  const filteredHeaders = computed<IEntityCrudHeader[]>(() => {
    const filtered = translatedHeaders.value.filter(header => 
      visibleColumns.value.includes(header.key)
    )
    const actions = entity.actionHeaders.map(header => ({
      ...header,
      title: te(header.title) ? t(header.title) : header.title,
    }))
    return [...filtered, ...actions]
  })

  // Lista de columnas disponibles para el menú
  const availableColumns = computed(() => {
    return translatedHeaders.value.map(header => ({
      key: header.key,
      title: header.title,
      visible: visibleColumns.value.includes(header.key)
    }))
  })

  // Toggle de visibilidad de columna
  const toggleColumn = (columnKey: string) => {
    const currentColumns = [...visibleColumns.value]
    const index = currentColumns.indexOf(columnKey)
    
    if (index > -1) {
      currentColumns.splice(index, 1)
    } else {
      currentColumns.push(columnKey)
    }
    
    crudStore.setVisibleColumns(currentColumns)
  }

  const allSelected = computed(() => 
    availableColumns.value.every(col => col.visible)
  )

  const someSelected = computed(() =>
    availableColumns.value.some(col => col.visible)
  )

  const selectAll = () => {
    availableColumns.value.forEach(column => {
      if (!column.visible) {
        toggleColumn(column.key)
      }
    })
  }

  const deselectAll = () => {
    availableColumns.value.forEach(column => {
      if (column.visible) {
        toggleColumn(column.key)
      }
    })
  }

  return {
    visibleColumns,
    translatedHeaders,
    filteredHeaders,
    availableColumns,
    toggleColumn,
    initializeVisibleColumns,
    allSelected,
    someSelected,
    selectAll,
    deselectAll,
  }
}
