
import {EntityCrud} from "@drax/crud-vue";
import LanguageProvider from "../providers/LanguageProvider";
import {IEntityCrud, IEntityCrudField, IEntityCrudHeader} from "@drax/crud-share";


class LanguageCrud extends EntityCrud implements IEntityCrud {

  static singleton: LanguageCrud

  constructor() {
    super();
    this.name = 'Language'
  }

  static get instance(): LanguageCrud {
    if(!LanguageCrud.singleton){
      LanguageCrud.singleton = new LanguageCrud()
    }
    return LanguageCrud.singleton
  }

  get permissions(){
    return {
      manage: 'language:manage',
      view: 'language:view',
      create: 'language:create',
      update: 'language:update',
      delete: 'language:delete'
    }
  }

  get headers():IEntityCrudHeader[] {
    return [
        {title: 'name',key:'name', align: 'start'}
    ]
  }

  get provider(){
    return LanguageProvider.instance
  }

  get refs(){
    return {

    }
  }

  get rules(){
    return {
      name: [(v: any) => !!v || 'validation.required']
    }
  }

  get fields(): IEntityCrudField[]{
    return [
        {name: 'name', type: 'string', label: 'name', default:'' }
    ]
  }

  get dialogFullscreen(){
    return false
  }

}

export default LanguageCrud

