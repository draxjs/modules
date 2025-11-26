
import { computed } from 'vue'
import type { IEntityCrudFilter } from '@drax/crud-share'

export function useFilterIcon() {
  const filterIcon = computed(() => {
    return (field: IEntityCrudFilter) => {
      switch(field.operator){
        case 'eq':
          return 'mdi-equal'
        case 'ne':
          return 'mdi-not-equal'
        case 'gt':
          return 'mdi-greater-than'
        case 'gte':
          return 'mdi-greater-than-or-equal'
        case 'lt':
          return 'mdi-less-than'
        case 'lte':
          return 'mdi-less-than-or-equal'
        case 'in':
          return 'mdi-code-array'
        case 'nin':
          return 'mdi-not-equal'
        case 'like':
          return 'mdi-contain'
        default:
          return 'mdi-equal'
      }
    }
  })

  return {
    filterIcon
  }
}
