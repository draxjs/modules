import {EntityCrud} from "@drax/crud-vue";
import {UserSystemFactory} from "@drax/identity-front";
import {RoleCrud} from '../role-crud/RoleCrud'
import {TenantCrud} from '../tenant-crud/TenantCrud'
import {useAuthStore} from '../../stores/AuthStore'

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
      manage: 'user:manage',
      view: 'user:view',
      create: 'user:create',
      update: 'user:update',
      delete: 'user:delete'
    }
  }

  get isTenantEnabled(){
    const authStore = useAuthStore()
    return import.meta.env.VITE_DRAX_TENANT === 'ENABLE' && authStore.hasPermission('tenant:view')
  }


  get headers():IEntityCrudHeader[] {
    return [
      { title: 'avatar', key: 'avatar', align: 'start', width:'50px' },
      { title: 'name', key: 'name', align: 'start' },
      { title: 'username', key: 'username', align: 'start' },
      { title: 'email', key: 'email', align: 'start' },
      { title: 'role', key: 'role', align: 'start' },
      ...(this.isTenantEnabled ? [{ title: 'tenant', key: 'tenant.name', align: 'start' as const }] : []),
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
        {name: 'role', type: 'ref', ref: 'role', refDisplay:'name', label: 'role', default:null },
        {name: 'tenant', type: 'ref', ref: 'tenant', refDisplay:'name', label: 'tenant', default:null, permission: 'tenant:manage' },
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
    return ['id', 'name','username','email','phone','role.name','tenant.name','active']
  }

  get exportFormats(){
    return ['CSV']
  }

  get isExportable(){
    return true
  }

  get isImportable(){
    return false
  }

  get isEditable(){
    return true
  }

  get isColumnSelectable() {
    return true
  }

  get isGroupable(){
    return true
  }

  isItemEditable(item?:any) {
    const authStore = useAuthStore()
    if(authStore?.authUser?.role?.childRoles && authStore?.authUser?.role?.childRoles.length > 0){
      return  authStore.authUser.role.childRoles.some(role => role.name === item.role.name)
    }else{
      return true
    }
  }

  isItemDeletable(item?:any) {
    const authStore = useAuthStore()
    if(authStore?.authUser?.role?.childRoles && authStore?.authUser?.role?.childRoles.length > 0){
      return  authStore.authUser.role.childRoles.some(role => role.name === item.role.name)
    }else{
      return true
    }
  }

  get searchEnable() {
    return true
  }

  get filterButtons() {
    return false
  }

  get containerFluid(): boolean{
    return true
  }
}

export default UserCrud

