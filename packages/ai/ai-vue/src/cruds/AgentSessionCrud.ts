
import {EntityCrud} from "@drax/crud-vue";
import type {
  IDraxCrudProvider,
  IEntityCrud,
  IEntityCrudField,
  IEntityCrudFilter,
  IEntityCrudHeader, IEntityCrudOperation,
  IEntityCrudPermissions,
  IEntityCrudRefs,
  IEntityCrudRules
} from "@drax/crud-share";
import {AgentSessionProvider} from "@drax/ai-front";

//Import EntityCrud Refs
import {TenantCrud} from "@drax/identity-vue"
import {UserCrud} from "@drax/identity-vue"

class AgentSessionCrud extends EntityCrud implements IEntityCrud {

  static singleton: AgentSessionCrud

  constructor() {
    super();
    this.name = 'AgentSession'
  }

  static get instance(): AgentSessionCrud {
    if(!AgentSessionCrud.singleton){
      AgentSessionCrud.singleton = new AgentSessionCrud()
    }
    return AgentSessionCrud.singleton
  }

  get permissions(): IEntityCrudPermissions{
    return {
      manage: 'agentsession:manage',
      view: 'agentsession:view',
      create: 'agentsession:create',
      update: 'agentsession:update',
      delete: 'agentsession:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
        {title: 'sessionId',key:'sessionId', align: 'start'},
{title: 'title',key:'title', align: 'start'},
{title: 'lastMessageAt',key:'lastMessageAt', align: 'start'},
{title: 'messageCount',key:'messageCount', align: 'start'},
{title: 'inputTokens',key:'inputTokens', align: 'start'},
{title: 'outputTokens',key:'outputTokens', align: 'start'},
{title: 'tokens',key:'tokens', align: 'start'},
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
    return AgentSessionProvider.instance
  }

  get refs(): IEntityCrudRefs{
    return {
      Tenant: TenantCrud.instance ,
User: UserCrud.instance
    }
  }

  get rules():IEntityCrudRules{
    return {
      sessionId: [(v: any) => !!v || 'validation.required'],
messages: []
    }
  }

  get fields(): IEntityCrudField[]{
    return [
        {name:'sessionId',type:'string',label:'sessionId',default:''},
{name:'title',type:'string',label:'title',default:''},
{name:'lastMessageAt',type:'date',label:'lastMessageAt',default:null,groupTab: 'SESSION'},
{name:'messages',type:'array.object',label:'messages',default:[],groupTab: 'MESSAGES',objectFields: [{name:'role',type:'enum',label:'role',default:null,enum: ['user', 'assistant', 'system']},
{name:'content',type:'longString',label:'content',default:''},
{name:'createdAt',type:'date',label:'createdAt',default:null}]},
{name:'messageCount',type:'number',label:'messageCount',default:null,groupTab: 'USAGE'},
{name:'inputTokens',type:'number',label:'inputTokens',default:null,groupTab: 'USAGE'},
{name:'outputTokens',type:'number',label:'outputTokens',default:null,groupTab: 'USAGE'},
{name:'tokens',type:'number',label:'tokens',default:null,groupTab: 'USAGE'},
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
    return false
  }

  get isCreatable(){
    return false
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
     'MESSAGES', 'USAGE', 'MANAGE'
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

  get isAiAssistable(){
    return false
  }

  get navigationOperations(): IEntityCrudOperation[]{
    return ['view'] // edit, delete
  }

  get isSavedQueriesEnabled(){
    return true
  }

}

export default AgentSessionCrud

