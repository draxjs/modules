
import {EntityCrud} from "@drax/crud-vue";
import type{
  IDraxCrudProvider,
  IEntityCrud,
  IEntityCrudField,
  IEntityCrudFilter,
  IEntityCrudHeader, 
  IEntityCrudPermissions,
  IEntityCrudRefs,
  IEntityCrudRules
} from "@drax/crud-share";
import PersonProvider from "../providers/PersonProvider";

//Import EntityCrud Refs
import CountryCrud from "./CountryCrud";
import LanguageCrud from "./LanguageCrud";

class PersonCrud extends EntityCrud implements IEntityCrud {

  static singleton: PersonCrud

  constructor() {
    super();
    this.name = 'Person'
  }
  
  static get instance(): PersonCrud {
    if(!PersonCrud.singleton){
      PersonCrud.singleton = new PersonCrud()
    }
    return PersonCrud.singleton
  }

  get permissions(): IEntityCrudPermissions{
    return {
      manage: 'person:manage', 
      view: 'person:view', 
      create: 'person:create', 
      update: 'person:update', 
      delete: 'person:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
        {title: 'fullname',key:'fullname', align: 'start'},
{title: 'live',key:'live', align: 'start'},
{title: 'birthdate',key:'birthdate', align: 'start'},
{title: 'nationality',key:'nationality', align: 'start'},
{title: 'hobbies',key:'hobbies', align: 'start'},
{title: 'race',key:'race', align: 'start'},
{title: 'interests',key:'interests', align: 'start'},
{title: 'languages',key:'languages', align: 'start'},
{title: 'address',key:'address', align: 'start'}
    ]
  }

  get provider(): IDraxCrudProvider<any, any, any>{
    return PersonProvider.instance
  }
  
  get refs(): IEntityCrudRefs{
    return {
      Country: CountryCrud.instance ,
Language: LanguageCrud.instance 
    }
  }

  get rules():IEntityCrudRules{
    return {
      fullname: [(v: any) => !!v || 'validation.required'],
live: [],
birthdate: [],
nationality: [],
hobbies: [],
race: [],
interests: [],
languages: [],
address: [],
skills: []
    }
  }

  get fields(): IEntityCrudField[]{
    return [
        {name: 'fullname', type: 'string', label: 'fullname', default:'' },
{name: 'live', type: 'boolean', label: 'live', default:false },
{name: 'birthdate', type: 'date', label: 'birthdate', default:null },
{name: 'nationality', type: 'ref', ref: 'Country', refDisplay: 'name',label: 'nationality', default:null },
{name: 'hobbies', type: 'array.string', label: 'hobbies', default:[] },
{name: 'race', type: 'enum', enum: ['human', 'elf', 'orc'], label: 'race', default:null },
{name: 'interests', type: 'array.enum', enum: ['sports', 'music', 'reading', 'travel', 'cooking', 'technology'], label: 'interests', default:[] },
{name: 'languages', type: 'array.ref', ref: 'Language', label: 'languages', default:[] },
{name: 'address', type: 'object', label: 'address', default:{}, objectFields: [{name: 'country', type: 'string', label: 'country', default:'' },
{name: 'city', type: 'string', label: 'city', default:'' },
{name: 'street', type: 'string', label: 'street', default:'' },
{name: 'zip', type: 'string', label: 'zip', default:'' }] },
{name: 'skills', type: 'array.object', label: 'skills', default:[], objectFields: [{name: 'name', type: 'string', label: 'name', default:'' },
{name: 'level', type: 'number', label: 'level', default: 0 }] }
    ]
  }
  
  get filters():IEntityCrudFilter[]{
    return [
      //{name: '_id', type: 'string', label: 'ID', default: '', operator: 'eq' },
    ]
  }
  
  get isViewable(){
    return true
  }

  get isEditable(){
    return true
  }

  get isCreatable(){
    return true
  }

  get isDeletable(){
    return true
  }

  get isExportable(){
    return true
  }

  get exportFormats(){
    return ['CSV', 'JSON']
  }

  get exportHeaders(){
    return ['_id']
  }

  get isImportable(){
    return true
  }

  get importFormats(){
    return ['CSV', 'JSON']
  }

  get dialogFullscreen(){
    return false
  }

}

export default PersonCrud

