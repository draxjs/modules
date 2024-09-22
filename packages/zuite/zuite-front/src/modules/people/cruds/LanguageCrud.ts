
import {EntityCrud} from "@drax/crud-vue";
import type {IFields} from "@drax/crud-vue";
import LanguageProvider from "../providers/LanguageProvider";

//Import EntityCrud Refs


class LanguageCrud extends EntityCrud {

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

  get headers() {
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
      name: [(v: any) => v || 'Requerido']
    }
  }

  get fields():IFields{
    return [
        {name: 'name', type: 'string', label: 'name', default:'' }
    ]
  }
  
  get dialogFullscreen(){
    return false
  }

}

export default LanguageCrud

