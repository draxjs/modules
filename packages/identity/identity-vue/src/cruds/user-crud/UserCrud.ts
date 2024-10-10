

import {EntityCrud} from "@drax/crud-vue";
import {UserSystemFactory} from "@drax/identity-front";
import {RoleCrud} from '../role-crud/RoleCrud'
import {TenantCrud} from '../tenant-crud/TenantCrud'
import type {
  IEntityCrud,
  IEntityCrudField,
  IEntityCrudFilter,
  IEntityCrudHeader,
  IEntityCrudRefs
} from "@drax/crud-share";


class UserCrud extends EntityCrud implements IEntityCrud {

  static singleton: UserCrud

  constructor() {
    super();
    this.name = 'User'
  }

  static get instance(): UserCrud {
    if(!UserCrud.singleton){
      UserCrud.singleton = new UserCrud()
    }
    return UserCrud.singleton
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
      { title: 'name', key: 'name', align: 'start' },
      { title: 'username', key: 'username', align: 'start' },
      { title: 'email', key: 'email', align: 'start' },
      { title: 'role', key: 'role.name', align: 'start' },
      { title: 'tenant', key: 'tenant.name', align: 'start' },
      { title: 'active', key: 'active', align: 'start' },
    ]
  }

  get provider(){
    return UserSystemFactory.getInstance()
  }

  get refs():IEntityCrudRefs{
    return {
      role: RoleCrud.instance,
      tenant: TenantCrud.instance,
    }
  }

  get rules(){
    return {
      name: [(v: any) => !!v || 'Requerido']
    }
  }

  get fields(): IEntityCrudField[]{
    return [
        {name: 'name', type: 'string', label: 'name', default:'' },
        {name: 'username', type: 'string', label: 'username', default:'' },
        {name: 'email', type: 'string', label: 'email', default:'' },
        {name: 'phone', type: 'string', label: 'phone', default:'' },
        {name: 'role', type: 'ref', ref: 'role', label: 'role', default:null },
        {name: 'tenant', type: 'ref', ref: 'tenant', label: 'tenant', default:null },
        {name: 'active', type: 'boolean',  label: 'active', default:true },

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
    return ['_id', 'name','username','email','phone','role.name','tenant.name','active']
  }

}

export default UserCrud

