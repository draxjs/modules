import type {IEntityCrud} from '@drax/crud-share'

export function useCrudRefDisplay() {

  async function refDisplay(entity: IEntityCrud, value: any, refDisplay: string) {
    try{
      if(entity?.provider?.findByIds){
        // Asegurar que value sea un array
        const ids = Array.isArray(value) ? value : [value]
        const items = await entity.provider.findByIds(ids)
        return items.map(item => item[refDisplay as any]).join(', ')
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
