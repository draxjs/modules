// Utilities
import { defineStore } from 'pinia'
import UserCrud from "../cruds/user-crud/UserCrud";
import UserApiKeyCrud from "../cruds/user-api-key-crud/UserApiKeyCrud";
import RoleCrud from "../cruds/role-crud/RoleCrud";
import TenantCrud from "../cruds/tenant-crud/TenantCrud";
import type {IEntityCrud} from "@drax/crud-share";

export const useIdentityCrudStore = defineStore('IdentityCrudStore', {
  state: (): {
    userCrud: IEntityCrud;
    userApiKeyCrud: IEntityCrud;
    roleCrud: IEntityCrud;
    tenantCrud: IEntityCrud;
  } => ({
    userCrud: UserCrud.instance,
    userApiKeyCrud: UserApiKeyCrud.instance,
    roleCrud: RoleCrud.instance,
    tenantCrud: TenantCrud.instance,
  }),
  actions:{
    setUserCrud(userCrud: IEntityCrud){
      this.userCrud = userCrud
    },
    setUserApiKeyCrud(userApiKeyCrud: IEntityCrud){
      this.userApiKeyCrud = userApiKeyCrud
    },
    setRoleCrud(roleCrud:IEntityCrud){
      this.roleCrud = roleCrud
    },
    setTenantCrud(tenantCrud:IEntityCrud){
      this.tenantCrud = tenantCrud
    },

  }
})
