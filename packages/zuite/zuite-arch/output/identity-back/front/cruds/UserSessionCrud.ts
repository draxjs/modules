
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
import UserSessionProvider from "../providers/UserSessionProvider";

//Import EntityCrud Refs
import {UserCrud} from "@drax/identity-vue"

class UserSessionCrud extends EntityCrud implements IEntityCrud {

  static singleton: UserSessionCrud

  constructor() {
    super();
    this.name = 'UserSession'
  }
  
  static get instance(): UserSessionCrud {
    if(!UserSessionCrud.singleton){
      UserSessionCrud.singleton = new UserSessionCrud()
    }
    return UserSessionCrud.singleton
  }

  get permissions(): IEntityCrudPermissions{
    return {
      manage: 'usersession:manage', 
      view: 'usersession:view', 
      create: 'usersession:create', 
      update: 'usersession:update', 
      delete: 'usersession:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
        {title: 'uuid',key:'uuid', align: 'start'},
{title: 'user',key:'user', align: 'start'},
{title: 'agent',key:'agent', align: 'start'},
{title: 'ip',key:'ip', align: 'start'},
{title: 'createdAt',key:'createdAt', align: 'start'}
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
        minWidth: '190px'
      },
    ]
  }

  get provider(): IDraxCrudProvider<any, any, any>{
    return UserSessionProvider.instance
  }
  
  get refs(): IEntityCrudRefs{
    return {
      User: UserCrud.instance 
    }
  }

  get rules():IEntityCrudRules{
    return {
      uuid: [(v: any) => !!v || 'validation.required'],
user: [(v: any) => !!v || 'validation.required'],
agent: [],
ip: [],
createdAt: []
    }
  }

  get fields(): IEntityCrudField[]{
    return [
        {name:'uuid',type:'string',label:'uuid',default:''},
{name:'user',type:'ref',label:'user',default:null,ref: 'User',refDisplay: 'username'},
{name:'agent',type:'string',label:'agent',default:''},
{name:'ip',type:'string',label:'ip',default:''},
{name:'createdAt',type:'date',label:'createdAt',default:null}
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

export default UserSessionCrud

