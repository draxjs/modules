
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
import CountryProvider from "../providers/CountryProvider";

//Import EntityCrud Refs
import {TenantCrud} from "@drax/identity-vue"
import {UserCrud} from "@drax/identity-vue"

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

  get permissions(): IEntityCrudPermissions{
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
        {title: 'name',key:'name', align: 'start'},
{title: 'description',key:'description', align: 'start'},
{title: 'flag',key:'flag', align: 'start'},
{title: 'tenant',key:'tenant', align: 'start'},
{title: 'createdBy',key:'createdBy', align: 'start'}
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
    return CountryProvider.instance
  }
  
  get refs(): IEntityCrudRefs{
    return {
      Tenant: TenantCrud.instance ,
User: UserCrud.instance 
    }
  }

  get rules():IEntityCrudRules{
    return {
      name: [(v: any) => !!v || 'validation.required'],
description: [],
flag: [],
tenant: [(v: any) => !!v || 'validation.required'],
createdBy: [(v: any) => !!v || 'validation.required']
    }
  }

  get fields(): IEntityCrudField[]{
    return [
        {name:'name',type:'string',label:'name',default:''},
{name:'description',type:'longString',label:'description',default:'Some Description',groupMenu: 'BASIC'},
{name:'flag',type:'file',label:'flag',default:'',groupMenu: 'EXTENDED',prependInnerIcon: 'mdi mdi-attachment'},
{name:'tenant',type:'ref',label:'tenant',default:null,ref: 'Tenant',refDisplay: 'name'},
{name:'createdBy',type:'ref',label:'createdBy',default:null,ref: 'User',refDisplay: 'username'}
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
     'BASIC', 'EXTENDED'
    ]
  }


}

export default CountryCrud

