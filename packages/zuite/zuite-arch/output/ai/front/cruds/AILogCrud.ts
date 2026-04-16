
import {EntityCrud, useCrudStore} from "@drax/crud-vue";
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
import AILogProvider from "../providers/AILogProvider";

//Import EntityCrud Refs
import {TenantCrud} from "@drax/identity-vue"
import {UserCrud} from "@drax/identity-vue"

class AILogCrud extends EntityCrud implements IEntityCrud {

  static singleton: AILogCrud
  private store

  constructor() {
    super();
    this.name = 'AILog'
    this.store = useCrudStore(this.name)
  }
  
  static get instance(): AILogCrud {
    if(!AILogCrud.singleton){
      AILogCrud.singleton = new AILogCrud()
    }
    return AILogCrud.singleton
  }

  get permissions(): IEntityCrudPermissions{
    return {
      manage: 'ailog:manage', 
      view: 'ailog:view', 
      create: 'ailog:create', 
      update: 'ailog:update', 
      delete: 'ailog:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
        {title: 'provider',key:'provider', align: 'start'},
{title: 'model',key:'model', align: 'start'},
{title: 'operationTitle',key:'operationTitle', align: 'start'},
{title: 'operationGroup',key:'operationGroup', align: 'start'},
{title: 'inputTokens',key:'inputTokens', align: 'start'},
{title: 'outputTokens',key:'outputTokens', align: 'start'},
{title: 'tokens',key:'tokens', align: 'start'},
{title: 'startedAt',key:'startedAt', align: 'start'},
{title: 'endedAt',key:'endedAt', align: 'start'},
{title: 'responseTime',key:'responseTime', align: 'start'},
{title: 'success',key:'success', align: 'start'},
{title: 'statusCode',key:'statusCode', align: 'start'},
{title: 'tenant',key:'tenant', align: 'start'},
{title: 'user',key:'user', align: 'start'}
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
    return AILogProvider.instance
  }
  
  get refs(): IEntityCrudRefs{
    return {
      Tenant: TenantCrud.instance ,
User: UserCrud.instance 
    }
  }

  get rules():IEntityCrudRules{
    return {
      inputImages: [],
inputFiles: []
    }
  }

  get fields(): IEntityCrudField[]{
    return [
        {name:'provider',type:'string',label:'provider',default:'',groupTab: 'REQUEST'},
{name:'model',type:'string',label:'model',default:'',groupTab: 'REQUEST'},
{name:'operationTitle',type:'string',label:'operationTitle',default:'',groupTab: 'REQUEST'},
{name:'operationGroup',type:'string',label:'operationGroup',default:'',groupTab: 'REQUEST'},
{name:'ip',type:'string',label:'ip',default:'',groupTab: 'REQUEST'},
{name:'userAgent',type:'longString',label:'userAgent',default:'',groupTab: 'REQUEST'},
{name:'input',type:'longString',label:'input',default:'',groupTab: 'REQUEST'},
{name:'inputImages',type:'array.object',label:'inputImages',default:[],groupTab: 'FILES',objectFields: [{name:'filename',type:'string',label:'filename',default:''},
{name:'filepath',type:'string',label:'filepath',default:''},
{name:'size',type:'number',label:'size',default:null},
{name:'mimetype',type:'string',label:'mimetype',default:''},
{name:'url',type:'string',label:'url',default:''}]},
{name:'inputFiles',type:'array.object',label:'inputFiles',default:[],groupTab: 'FILES',objectFields: [{name:'filename',type:'string',label:'filename',default:''},
{name:'filepath',type:'string',label:'filepath',default:''},
{name:'size',type:'number',label:'size',default:null},
{name:'mimetype',type:'string',label:'mimetype',default:''},
{name:'url',type:'string',label:'url',default:''}]},
{name:'inputTokens',type:'number',label:'inputTokens',default:null,groupTab: 'USAGE'},
{name:'outputTokens',type:'number',label:'outputTokens',default:null,groupTab: 'USAGE'},
{name:'tokens',type:'number',label:'tokens',default:null,groupTab: 'USAGE'},
{name:'startedAt',type:'date',label:'startedAt',default:null,groupTab: 'USAGE'},
{name:'endedAt',type:'date',label:'endedAt',default:null,groupTab: 'USAGE'},
{name:'responseTime',type:'string',label:'responseTime',default:'',groupTab: 'USAGE'},
{name:'output',type:'longString',label:'output',default:'',groupTab: 'RESULT'},
{name:'success',type:'boolean',label:'success',default:false,groupTab: 'RESULT'},
{name:'statusCode',type:'number',label:'statusCode',default:null,groupTab: 'RESULT'},
{name:'errorMessage',type:'longString',label:'errorMessage',default:'',groupTab: 'RESULT'},
{name:'tenant',type:'ref',label:'tenant',default:null,groupTab: 'MANAGE',ref: 'Tenant',refDisplay: 'name'},
{name:'user',type:'ref',label:'user',default:null,groupTab: 'MANAGE',ref: 'User',refDisplay: 'username'}
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
    return false
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
     'REQUEST', 'FILES', 'USAGE', 'RESULT', 'MANAGE'
    ]
  }
  
  get menus() {
    return [
     
    ]
  }
  
  get searchEnable() {
    return true
  }

   get filtersEnable(){
    return true
  }

  get dynamicFiltersEnable(){
    return true
  }


}

export default AILogCrud

