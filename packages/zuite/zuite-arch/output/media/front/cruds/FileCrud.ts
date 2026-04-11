
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
import FileProvider from "../providers/FileProvider";

//Import EntityCrud Refs


class FileCrud extends EntityCrud implements IEntityCrud {

  static singleton: FileCrud
  private store

  constructor() {
    super();
    this.name = 'File'
    this.store = useCrudStore(this.name)
  }
  
  static get instance(): FileCrud {
    if(!FileCrud.singleton){
      FileCrud.singleton = new FileCrud()
    }
    return FileCrud.singleton
  }

  get permissions(): IEntityCrudPermissions{
    return {
      manage: 'file:manage', 
      view: 'file:view', 
      create: 'file:create', 
      update: 'file:update', 
      delete: 'file:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
        {title: 'filename',key:'filename', align: 'start'},
{title: 'url',key:'url', align: 'start'},
{title: 'mimetype',key:'mimetype', align: 'start'},
{title: 'extension',key:'extension', align: 'start'},
{title: 'size',key:'size', align: 'start'},
{title: 'type',key:'type', align: 'start'},
{title: 'lastAccess',key:'lastAccess', align: 'start'},
{title: 'createdAt',key:'createdAt', align: 'start'},
{title: 'isPublic',key:'isPublic', align: 'start'},
{title: 'hits',key:'hits', align: 'start'}
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
    return FileProvider.instance
  }
  
  get refs(): IEntityCrudRefs{
    return {
      
    }
  }

  get rules():IEntityCrudRules{
    return {
      filename: [(v: any) => !!v || 'validation.required'],
relativePath: [(v: any) => !!v || 'validation.required'],
absolutePath: [(v: any) => !!v || 'validation.required'],
url: [(v: any) => !!v || 'validation.required'],
mimetype: [(v: any) => !!v || 'validation.required'],
encoding: [(v: any) => !!v || 'validation.required'],
extension: [(v: any) => !!v || 'validation.required'],
size: [(v: any) => !!v || 'validation.required'],
type: [(v: any) => !!v || 'validation.required'],
lastAccess: [(v: any) => !!v || 'validation.required'],
createdAt: [(v: any) => !!v || 'validation.required'],
updatedAt: [(v: any) => !!v || 'validation.required'],
createdBy: [],
updatedBy: [],
ttlSeconds: [(v: any) => !!v || 'validation.required']
    }
  }

  get fields(): IEntityCrudField[]{
    return [
        {name:'filename',type:'string',label:'filename',default:''},
{name:'relativePath',type:'string',label:'relativePath',default:''},
{name:'absolutePath',type:'string',label:'absolutePath',default:''},
{name:'url',type:'string',label:'url',default:''},
{name:'description',type:'longString',label:'description',default:''},
{name:'tags',type:'array.string',label:'tags',default:[]},
{name:'mimetype',type:'string',label:'mimetype',default:''},
{name:'encoding',type:'string',label:'encoding',default:''},
{name:'extension',type:'string',label:'extension',default:''},
{name:'size',type:'number',label:'size',default:null},
{name:'type',type:'string',label:'type',default:''},
{name:'lastAccess',type:'date',label:'lastAccess',default:null},
{name:'createdAt',type:'date',label:'createdAt',default:null},
{name:'updatedAt',type:'date',label:'updatedAt',default:null},
{name:'createdBy',type:'object',label:'createdBy',default:{"id":"''","username":"''"},objectFields: [{name:'id',type:'string',label:'id',default:''},
{name:'username',type:'string',label:'username',default:''}]},
{name:'updatedBy',type:'object',label:'updatedBy',default:{"id":"''","username":"''"},objectFields: [{name:'id',type:'string',label:'id',default:''},
{name:'username',type:'string',label:'username',default:''}]},
{name:'createdFor',type:'string',label:'createdFor',default:''},
{name:'ttlSeconds',type:'number',label:'ttlSeconds',default:null},
{name:'expiresAt',type:'date',label:'expiresAt',default:null},
{name:'isPublic',type:'boolean',label:'isPublic',default:true},
{name:'hits',type:'number',label:'hits',default:0}
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

export default FileCrud

