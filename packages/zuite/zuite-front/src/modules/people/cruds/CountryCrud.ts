import {EntityCrud} from "@drax/crud-vue";
import {
  IDraxCrudProvider,
  IEntityCrud,
  IEntityCrudField,
  IEntityCrudHeader,
  IEntityCrudPermissions,
  IEntityCrudRefs,
  IEntityCrudRules
} from "@drax/crud-share";
import CountryProvider from "../providers/CountryProvider";

//Import EntityCrud Refs


class CountryCrud extends EntityCrud implements IEntityCrud {

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

  get permissions():IEntityCrudPermissions{
    return {
      manage: 'country:manage',
      view: 'country:view',
      create: 'country:create',
      update: 'country:update',
      delete: 'country:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
        {title: 'name',key:'name', align: 'start'}
    ]
  }

  //@ts-ignore
  get provider(): IDraxCrudProvider<any, any, any>{
    return CountryProvider.instance
  }

  get refs(): IEntityCrudRefs{
    return {

    }
  }

  get rules():IEntityCrudRules  {
    return {
      name: [(v: any) => v || 'Requerido']
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

  get exportHeaders(){
    return ['_id', 'name']
  }

}

export default CountryCrud

