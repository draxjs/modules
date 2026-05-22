import type {IEntityCrud} from '@drax/crud-share'

export function useCrudRefDisplay() {

  function getDisplayValue(item: any, displayField: string, fallback: any = '') {
    return item?.[displayField] ?? fallback
  }

  async function refDisplay(entity: IEntityCrud, value: any, displayField?: string) {
    try{
      const field = displayField ?? entity.displayField

      if(value == null || !field){
        return value
      }

      if(Array.isArray(value)){
        if(!entity?.provider?.findByIds){
          return value
        }
        const ids = value
        const items = await entity.provider.findByIds(ids)
        return items.map(item => getDisplayValue(item, field)).join(', ')
      }

      if(entity?.provider?.findById){
        const item = await entity.provider.findById(value)
        return item ? getDisplayValue(item, field, value) : value
      }

      if(entity?.provider?.findByIds){
        const items = await entity.provider.findByIds([value])
        return items[0] ? getDisplayValue(items[0], field, value) : value
      }

      return value
    }catch (e){
      console.error(e)
      return value
    }
  }

  return {
    refDisplay
  }
}
