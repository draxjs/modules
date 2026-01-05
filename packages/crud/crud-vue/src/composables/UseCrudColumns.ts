
import { computed } from 'vue'
import type { IEntityCrud, IEntityCrudHeader } from '@drax/crud-share'
import { useAuth } from '@drax/identity-vue'
import { useI18n } from 'vue-i18n'
import { useCrudStore } from '../stores/UseCrudStore'

export function useCrudColumns(entity: IEntityCrud) {
  const { hasPermission } = useAuth()
  const { t, te } = useI18n()
  const crudStore = useCrudStore(entity?.name)

  // Clave única para localStorage basada en el nombre de la entidad
  const storageKey = `crud_visible_columns_${entity.name.toLowerCase()}`

  // Cargar columnas desde localStorage
  const loadColumnsFromStorage = (): string[] | null => {
    try {
      const stored = localStorage.getItem(storageKey)
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.error('Error loading columns from localStorage:', error)
      return null
    }
  }

  // Guardar columnas en localStorage
  const saveColumnsToStorage = (columns: string[]) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(columns))
    } catch (error) {
      console.error('Error saving columns to localStorage:', error)
    }
  }

  // Inicializar columnas visibles si no existen en el store
  const initializeVisibleColumns = () => {
    if (crudStore.visibleColumns.length === 0) {
      const availableHeaders = entity.headers
        .filter(header => !header.permission || hasPermission(header.permission))
        .map(header => header.key)

      // Intentar cargar desde localStorage primero
      const storedColumns = loadColumnsFromStorage()

      let initialColumns: string[]

      if (storedColumns) {
        // Filtrar columnas almacenadas para asegurar que aún existen y tienen permisos
        initialColumns = storedColumns.filter(key => availableHeaders.includes(key))

        // Si no quedaron columnas válidas, usar las predeterminadas
        if (initialColumns.length === 0) {
          initialColumns = entity.selectedHeaders?.filter(key =>
            availableHeaders.includes(key)
          ) || availableHeaders
        }
      } else {
        // Si no hay columnas guardadas, usar selectedHeaders o todas las disponibles
        initialColumns = entity.selectedHeaders?.filter(key =>
          availableHeaders.includes(key)
        ) || availableHeaders
      }

      crudStore.setVisibleColumns(initialColumns)
      // Guardar la configuración inicial en localStorage
      saveColumnsToStorage(initialColumns)
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
    // Guardar cambios en localStorage
    saveColumnsToStorage(currentColumns)
  }

  const allSelected = computed(() =>
    availableColumns.value.every(col => col.visible)
  )

  const someSelected = computed(() =>
    availableColumns.value.some(col => col.visible)
  )

  const selectAll = () => {
    const allColumns = availableColumns.value.map(col => col.key)
    crudStore.setVisibleColumns(allColumns)
    // Guardar cambios en localStorage
    saveColumnsToStorage(allColumns)
  }

  const deselectAll = () => {
    crudStore.setVisibleColumns([])
    // Guardar cambios en localStorage
    saveColumnsToStorage([])
  }

  // Función para resetear a las columnas predeterminadas
  const resetToDefault = () => {
    const availableHeaders = entity.headers
      .filter(header => !header.permission || hasPermission(header.permission))
      .map(header => header.key)

    const defaultColumns = entity.selectedHeaders?.filter(key =>
      availableHeaders.includes(key)
    ) || availableHeaders

    crudStore.setVisibleColumns(defaultColumns)
    saveColumnsToStorage(defaultColumns)
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
    resetToDefault,
  }
}
