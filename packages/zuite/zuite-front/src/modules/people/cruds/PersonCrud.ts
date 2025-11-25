import {EntityCrud} from "@drax/crud-vue";
import type {
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
import {TenantCrud, useAuthStore} from "@drax/identity-vue"
import {UserCrud} from "@drax/identity-vue"

class PersonCrud extends EntityCrud implements IEntityCrud {

  static singleton: PersonCrud

  constructor() {
    super();
    this.name = 'Person'
  }

  static get instance(): PersonCrud {
    if (!PersonCrud.singleton) {
      PersonCrud.singleton = new PersonCrud()
    }
    return PersonCrud.singleton
  }

  get permissions(): IEntityCrudPermissions {
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
      {title: 'fullname', key: 'fullname', align: 'start'},
      {title: 'live', key: 'live', align: 'start'},
      {title: 'birthdate', key: 'birthdate', align: 'start'},
       {title: 'nationality', key: 'nationality', align: 'start'},
      // {title: 'hobbies', key: 'hobbies', align: 'start'},
      {title: 'race', key: 'race', align: 'start'},
      // {title: 'interests', key: 'interests', align: 'start'},
      {title: 'languages', key: 'languages', align: 'start'},
      // {title: 'address', key: 'address', align: 'start'},
      {title: 'tenant', key: 'tenant', align: 'start'},
      {title: 'user', key: 'user', align: 'start'}
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
    return PersonProvider.instance
  }

  get refs(): IEntityCrudRefs {
    return {
      Country: CountryCrud.instance,
      Language: LanguageCrud.instance,
      Tenant: TenantCrud.instance,
      User: UserCrud.instance
    }
  }

  get rules(): IEntityCrudRules {
    return {
      fullname: [(v: any) => !!v || 'validation.required'],
      live: [],
      birthdate: [],
      secret: [],
      nationality: [],
      hobbies: [],
      race: [],
      interests: [],
      languages: [],
      address: [],
      skills: [],
      tenant: [],
      user: []
    }
  }

  get fields(): IEntityCrudField[] {
    return [
      {name: 'fullname', type: 'string', label: 'fullname', default: ''},
      {name: 'live', type: 'boolean', label: 'live', default: false, groupTab: 'BASIC'},
      {name: 'birthdate', type: 'date', label: 'birthdate', default: null, groupTab: 'BASIC'},
      {name: 'secret', type: 'password', label: 'secret', default: '', groupTab: 'BASIC'},
      {
        name: 'nationality',
        type: 'ref',
        label: 'nationality',
        default: null,
        groupTab: 'BASIC',
        ref: 'Country',
        refDisplay: 'name',
        noFilter: true
      },
      {name: 'hobbies', type: 'array.string', label: 'hobbies', default: [], groupTab: 'BASIC'},
      {name: 'race',
        type: 'enum',
        label: 'race',
        default: null,
        groupTab: 'BASIC',
        enum: ['human', 'elf', 'orc'],
        noFilter: false,
      },
      {
        name: 'interests',
        type: 'array.enum',
        label: 'interests',
        default: ["sports", "music"],
        groupTab: 'BASIC',
        enum: ['sports', 'music', 'reading', 'travel', 'cooking', 'technology']
      },
      {
        name: 'languages',
        type: 'array.ref',
        label: 'languages',
        default: [],
        groupTab: 'BASIC',
        ref: 'Language',
        refDisplay: 'name'
      },
      {
        name: 'address',
        type: 'object',
        label: 'address',
        default: {"country": "", "city": "", "street": "", "zip": null, "casa": false},
        groupTab: 'ADDRESS',
        objectFields: [{name: 'country', type: 'string', label: 'country', default: ''},
          {name: 'city', type: 'string', label: 'city', default: '', hint:'la city', persistentHint:true},
          {name: 'street', type: 'longString', label: 'street', default: ''},
          {name: 'zip', type: 'number', label: 'zip', default: null},
          {name: 'casa', type: 'boolean', label: 'casa', default: false}]
      },
      {
        name: 'skills',
        type: 'array.object',
        label: 'skills',
        default: [],
        groupTab: 'SKILLS',
        arrayObjectUI: 'chips',
        objectFields: [{name: 'name', type: 'string', label: 'name', default: ''},
          {name: 'level', type: 'number', label: 'level', default: null}]
      },
      {name: 'tenant', type: 'ref', label: 'tenant', default: null, groupTab: 'MANAGE', ref: 'Tenant', refDisplay: 'name'},
      {name: 'user', type: 'ref', label: 'user', default: null, groupTab: 'MANAGE', ref: 'User', refDisplay: 'username'}
    ]
  }

  get filters(): IEntityCrudFilter[] {
    return [
      {name: '_id', type: 'string', label: 'ID', default: null, operator: "eq"},
      {name: 'fullname', type: 'string', label: 'fullname', default: null, operator: "like"},
      {name: 'birthdate', type: 'date', label: 'birthdate', default: new Date(), operator: "lte", endOfDay: true},
      {
        name: 'nationality',
        type: 'array.ref',
        label: 'nationality',
        default: null,
        groupTab: 'BASIC',
        ref: 'Country',
        refDisplay: 'name',
        noFilter: true,
        operator: "in"
      },
    ]
  }

  get isViewable() {
    return true
  }

  get isEditable() {
    return true
  }

  get isCreatable() {
    // const authStore = useAuthStore()
    // return !!authStore?.authUser?.tenant
    return true
  }

  get isDeletable() {
    return true
  }

  get isExportable() {
    return false
  }

  get exportFormats() {
    return ['CSV', 'JSON']
  }

  get exportHeaders() {
    return ['_id']
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

  get dialogZindex() {
    return 5600
  }


  get tabs() {
    return [
      'BASIC', 'ADDRESS', 'SKILLS', 'MANAGE'
    ]
  }

  get menus() {
    return []
  }

  get filterButtons(){
    return true
  }

  get searchEnable(){
    return true
  }

  get striped(): null | 'odd' | 'even'{
    return 'even'
  }

  get headerProps(){
    return { class: 'bg-primary' }
  }

}

export default PersonCrud

