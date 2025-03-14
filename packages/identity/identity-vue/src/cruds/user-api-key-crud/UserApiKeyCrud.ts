
import {EntityCrud} from "@drax/crud-vue";
import {UserApiKeySystemFactory} from "@drax/identity-front";
import type {IEntityCrud, IEntityCrudField, IEntityCrudFilter, IEntityCrudHeader} from "@drax/crud-share";


class UserApiKeyCrud extends EntityCrud implements IEntityCrud {

  static singleton: UserApiKeyCrud

  constructor() {
    super();
    this.name = 'userApiKey'
  }

  static get instance(): UserApiKeyCrud {
    if(!UserApiKeyCrud.singleton){
      UserApiKeyCrud.singleton = new UserApiKeyCrud()
    }
    return UserApiKeyCrud.singleton
  }

  get permissions(){
    return {
      manage: 'userApiKey:manage',
      view: 'userApiKey:viewMy',
      create: 'userApiKey:createMy',
      update: 'userApiKey:update',
      delete: 'userApiKey:delete'
    }
  }

  get headers():IEntityCrudHeader[] {
    return [
        //{title: 'id',key:'_id', align: 'start'},
        {title: 'user',key:'user', align: 'start'},
        {title: 'name',key:'name', align: 'start'},
        {title: 'ipv4',key:'ipv4', align: 'start'},
        {title: 'ipv6',key:'ipv6', align: 'start'},
      //  {title: 'createdBy',key:'createdBy', align: 'start'},
        {title: 'createdAt',key:'createdAt', align: 'start'},
    ]
  }

  get provider(){
    return UserApiKeySystemFactory.getInstance()
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
        {name: 'ipv4', type: 'string', label: 'name', default:[], prependInnerIcon:'mdi-text-short'  },
        {name: 'ipv6', type: 'string', label: 'name', default:[], prependInnerIcon:'mdi-text-short'  },
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
    return ['id', 'name']
  }

  get isExportable(){
    return false
  }

  get isImportable(){
    return false
  }

}

export default UserApiKeyCrud
export { UserApiKeyCrud }
