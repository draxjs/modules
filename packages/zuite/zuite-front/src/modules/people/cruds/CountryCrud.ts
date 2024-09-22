
import {EntityCrud} from "@drax/crud-vue";
import type {IFields} from "@drax/crud-vue";
import CountryProvider from "../providers/CountryProvider";

//Import EntityCrud Refs


class CountryCrud extends EntityCrud {

  static singleton: CountryCrud

  constructor() {
    super();
    this.name = 'Country'
  }
  
  static get instance(): CountryCrud {
    if(!CountryCrud.singleton){
      CountryCrud.singleton = new CountryCrud()
    }
    return CountryCrud.singleton
  }

  get permissions(){
    return {
      manage: 'country:manage', 
      view: 'country:view', 
      create: 'country:create', 
      update: 'country:update', 
      delete: 'country:delete'
    }
  }

  get headers() {
    return [
        {title: 'name',key:'name', align: 'start'}
    ]
  }

  get provider(){
    return CountryProvider.instance
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

export default CountryCrud

