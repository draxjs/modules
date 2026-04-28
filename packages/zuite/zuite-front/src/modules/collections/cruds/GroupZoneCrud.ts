
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
import GroupZoneProvider from "../providers/GroupZoneProvider";

//Import EntityCrud Refs
import {UserCrud} from "@drax/identity-vue"

class GroupZoneCrud extends EntityCrud implements IEntityCrud {

  static singleton: GroupZoneCrud

  constructor() {
    super();
    this.name = 'GroupZone'
  }

  static get instance(): GroupZoneCrud {
    if(!GroupZoneCrud.singleton){
      GroupZoneCrud.singleton = new GroupZoneCrud()
    }
    return GroupZoneCrud.singleton
  }

  get permissions(): IEntityCrudPermissions{
    return {
      manage: 'groupzone:manage',
      view: 'groupzone:view',
      create: 'groupzone:create',
      update: 'groupzone:update',
      delete: 'groupzone:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
        {title: 'name',key:'name', align: 'start'},
        {title: 'users',key:'users', align: 'start'},
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
    return GroupZoneProvider.instance
  }

  get refs(): IEntityCrudRefs{
    return {
      User: UserCrud.instance
    }
  }

  get rules():IEntityCrudRules{
    return {
      name: [(v: any) => !!v || 'validation.required']
    }
  }

  get fields(): IEntityCrudField[]{
    return [
        {name:'name',type:'string',label:'name',default:''},
{name:'users',type:'array.ref',label:'users',default:[],ref: 'User',refDisplay: 'username'}
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

export default GroupZoneCrud

