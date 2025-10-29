
// import {UserSystemFactory} from "@drax/identity-front";
import {UserCrud} from "@drax/identity-vue";


import type {
  IEntityCrud, IEntityCrudHeader,
  // IEntityCrudField, IEntityCrudFilter, IEntityCrudHeader, IEntityCrudRefs
} from "@drax/crud-share";


class CustomUserCrud extends UserCrud implements IEntityCrud {

  static singleton: UserCrud

  constructor() {
    super();
    this.name = 'User'
  }

  static get instance(): UserCrud {
    if(!CustomUserCrud.singleton){
      CustomUserCrud.singleton = new CustomUserCrud()
    }
    return CustomUserCrud.singleton
  }

  get headers():IEntityCrudHeader[] {
    return [
      //{title: 'id',key:'_id', align: 'start'},
      { title: 'name', key: 'name', align: 'start' },
      { title: 'username', key: 'username', align: 'start' },
      // { title: 'email', key: 'email', align: 'start' },
      { title: 'role', key: 'role.name', align: 'start' },
      ...(this.isTenantEnabled ? [{ title: 'tenant', key: 'tenant.name', align: 'start' as const }] : []),
      { title: 'active', key: 'active', align: 'start' },
    ]
  }

  get applyFilterClass(){
    return 'bg-red'
  }

}

export default CustomUserCrud

