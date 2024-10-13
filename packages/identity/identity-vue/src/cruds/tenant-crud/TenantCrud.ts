
import {EntityCrud} from "@drax/crud-vue";
import {TenantSystemFactory} from "@drax/identity-front";
import type {IEntityCrud, IEntityCrudField, IEntityCrudFilter, IEntityCrudHeader} from "@drax/crud-share";


class TenantCrud extends EntityCrud implements IEntityCrud {

  static singleton: TenantCrud

  constructor() {
    super();
    this.name = 'Tenant'
  }

  static get instance(): TenantCrud {
    if(!TenantCrud.singleton){
      TenantCrud.singleton = new TenantCrud()
    }
    return TenantCrud.singleton
  }

  get permissions(){
    return {
      manage: 'tenant:manage',
      view: 'tenant:view',
      create: 'tenant:create',
      update: 'tenant:update',
      delete: 'tenant:delete'
    }
  }

  get headers():IEntityCrudHeader[] {
    return [
        //{title: 'id',key:'_id', align: 'start'},
        {title: 'name',key:'name', align: 'start'}
    ]
  }

  get provider(){
    return TenantSystemFactory.getInstance()
  }

  get refs(){
    return {

    }
  }

  get rules(){
    return {
      name: [(v: any) => !!v || 'Requerido']
    }
  }

  get fields(): IEntityCrudField[]{
    return [
        {name: 'name', type: 'string', label: 'name', default:'', prependInnerIcon:'mdi-text-short'  }
    ]
  }

  get filters():IEntityCrudFilter[]{
    return [

    ]
  }

  get dialogFullscreen(){
    return false
  }

  get exportHeaders(){
    return ['_id', 'name']
  }

  get isExportable(){
    return true
  }

  get isImportable(){
    return false
  }

}

export default TenantCrud
export { TenantCrud }
