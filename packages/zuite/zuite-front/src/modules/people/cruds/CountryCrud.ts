import {EntityCrud} from "@drax/crud-vue";
import type {
  IDraxCrudProvider,
  IEntityCrud,
  IEntityCrudField,
  IEntityCrudFilter,
  IEntityCrudHeader,
  IEntityCrudPermissions,
  IEntityCrudRefs,
  IEntityCrudRules,
  IEntityCrudFieldVariant
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
    if (!CountryCrud.singleton) {
      CountryCrud.singleton = new CountryCrud()
    }
    return CountryCrud.singleton
  }

  get permissions(): IEntityCrudPermissions {
    return {
      manage: 'country:manage',
      view: 'country:view',
      create: 'country:create',
      update: 'country:update',
      delete: 'country:delete'
    }
  }

  get selectedHeaders(){
    return ['name',  'flag', 'createdBy']
  }

  get headers(): IEntityCrudHeader[] {
    return [
      {title: 'name', key: 'name', align: 'start'},
      {title: 'description', key: 'description', align: 'start'},
      {title: 'flag', key: 'flag', align: 'start'},
      {title: 'createdBy', key: 'createdBy', align: 'start'},
    ]
  }

  get actionHeaders(): IEntityCrudHeader[] {
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

  get provider(): IDraxCrudProvider<any, any, any> {
    return CountryProvider.instance
  }

  get refs(): IEntityCrudRefs {
    return {}
  }

  get rules(): IEntityCrudRules {
    return {
      name: [(v: any) => !!v || 'validation.required'],
      description: [],
      flag: []
    }
  }

  get fields(): IEntityCrudField[] {
    return [
      {name: 'name', type: 'string', label: 'name', default: '', hint: 'Aca pone nombre', persistentHint: true},
      {name: 'description', type: 'longString', label: 'description', default: '', groupMenu: 'BASIC'},
      {
        name: 'flag',
        type: 'file',
        label: 'flag',
        default: '',
        groupMenu: 'EXTENDED',
        prependInnerIcon: 'mdi mdi-attachment'
      }
    ]
  }

  get filters(): IEntityCrudFilter[] {
    return [
      {name: '_id', type: 'string', label: 'ID', default: '', operator: 'eq' },
      {name: 'name', type: 'string', label: 'name', default: '', operator: 'eq' },
    ]
  }

  get isViewable() {
    return true
  }

  get isEditable() {
    return true
  }

  get isCreatable() {
    return true
  }

  get isDeletable() {
    return true
  }

  get isExportable() {
    return true
  }

  get exportFormats() {
    return ['CSV', 'JSON']
  }

  get exportHeaders() {
    return ['_id', 'name', 'description']
  }

  get exportHeadersTranslate() {
    return ['countryCrud.id', 'countryCrud.name', 'countryCrud.description']
  }

  get isImportable() {
    return false
  }

  get importFormats() {
    return ['CSV', 'JSON']
  }

  get dialogFullscreen() {
    return true
  }

  get tabs() {
    return []
  }

  get menus() {
    return [
      'BASIC', 'EXTENDED'
    ]
  }

  get filterButtons(){
    return true
  }

  get inputVariantEdit(): IEntityCrudFieldVariant{
    return 'filled'
  }



}

export default CountryCrud

