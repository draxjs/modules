
import {EntityCrud} from "@drax/crud-vue";
import {RoleSystemFactory} from "@drax/identity-front";
import type {IEntityCrud, IEntityCrudField, IEntityCrudFilter, IEntityCrudHeader} from "@drax/crud-share";


class RoleCrud extends EntityCrud implements IEntityCrud {

  static singleton: RoleCrud

  constructor() {
    super();
    this.name = 'Role'
  }

  static get instance(): RoleCrud {
    if(!RoleCrud.singleton){
      RoleCrud.singleton = new RoleCrud()
    }
    return RoleCrud.singleton
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
        {title: 'name',key:'name', align: 'start'},
        {title: 'permissions',key:'permissions', align: 'start'},
        {title: 'childRoles',key:'childRoles', align: 'start'},
        {title: 'readonly',key:'readonly', align: 'start'},
    ]
  }

  get provider(){
    return RoleSystemFactory.getInstance()
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
        {name: 'name', type: 'string', label: 'name', default:'', prependInnerIcon:'mdi-text-short'  },
        {name: 'childRoles', type: 'array.ref', ref:'Role', refDisplay: 'name', label: 'childRoles', default:[], prependInnerIcon:'mdi-text-short'  },
        {name: 'permissions', type: 'array.string',  label: 'childRoles', default:[], prependInnerIcon:'mdi-text-short'  }
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
    return ['id', 'name','permissions','childRoles','readonly']
  }

  get isExportable(){
    return true
  }

  get isImportable(){
    return false
  }

}

export default RoleCrud

export {RoleCrud}
