
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
import LanguageProvider from "../providers/LanguageProvider";

//Import EntityCrud Refs


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

  get permissions(): IEntityCrudPermissions{
    return {
      manage: 'language:manage', 
      view: 'language:view', 
      create: 'language:create', 
      update: 'language:update', 
      delete: 'language:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
        {title: 'name',key:'name', align: 'start'},
{title: 'icon',key:'icon', align: 'start'}
    ]
  }
  
  get selectedHeaders(): string[] {
    return this.headers.map(header => header.key)
  }
  
  get actionHeaders():IEntityCrudHeader[]{
    return [
      {
        title: 'action.actions',
        key: 'actions',
        sortable: false,
        align: 'center',
        minWidth: '190px',
        fixed: 'end'
      },
    ]
  }

  get provider(): IDraxCrudProvider<any, any, any>{
    return LanguageProvider.instance
  }
  
  get refs(): IEntityCrudRefs{
    return {
      
    }
  }

  get rules():IEntityCrudRules{
    return {
      name: [(v: any) => !!v || 'validation.required'],
icon: []
    }
  }

  get fields(): IEntityCrudField[]{
    return [
        {name:'name',type:'string',label:'name',default:''},
{name:'icon',type:'fullFile',label:'icon',default:{},prependInnerIcon: 'mdi mdi-attachment'}
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
  
  get isColumnSelectable() {
    return true
  }

  get isGroupable() {
    return true
  }

  get importFormats(){
    return ['CSV', 'JSON']
  }

  get dialogFullscreen(){
    return false
  }
  
  get tabs() {
    return [
     
    ]
  }
  
  get menus() {
    return [
     
    ]
  }


}

export default LanguageCrud

