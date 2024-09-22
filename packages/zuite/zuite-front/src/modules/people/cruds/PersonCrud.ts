import {EntityCrud} from "@drax/crud-vue";
import type {IFields} from "@drax/crud-vue";
import PersonProvider from "../providers/PersonProvider";

//Import EntityCrud Refs
import CountryCrud from "./CountryCrud";
import LanguageCrud from "./LanguageCrud";

class PersonCrud extends EntityCrud {

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

  get permissions() {
    return {
      manage: 'person:manage',
      view: 'person:view',
      create: 'person:create',
      update: 'person:update',
      delete: 'person:delete'
    }
  }

  get headers() {
    return [
      {title: 'fullname', key: 'fullname', align: 'start'},
      {title: 'live', key: 'live', align: 'start'},
      {title: 'birthdate', key: 'birthdate', align: 'start'},
      {title: 'nationality', key: 'nationality', align: 'start'},
      {title: 'hobbies', key: 'hobbies', align: 'start'},
      {title: 'languages', key: 'languages', align: 'start'},
      {title: 'address', key: 'address', align: 'start'}
    ]
  }

  get provider() {
    return PersonProvider.instance
  }

  get refs() {
    return {
      Country: CountryCrud,
      Language: LanguageCrud
    }
  }

  get rules() {
    return {
      fullname: [(v: any) => !!v || 'Requerido'],
      live: [(v: any) => !!v || 'Requerido'],
      birthdate: [(v: any) => !!v || 'Requerido'],
      nationality: [(v: any) => !!v || 'Requerido'],
      hobbies: [],
      languages: [],
      address: [],
      skills: []
    }
  }

  get fields(): IFields {
    return [
      {name: 'fullname', type: 'string', label: 'fullname', default: ''},
      {name: 'live', type: 'boolean', label: 'live', default: false},
      {name: 'birthdate', type: 'date', label: 'birthdate', default: null},
      {name: 'nationality', type: 'ref', ref: 'Country', label: 'nationality', default: null},
      {name: 'hobbies', type: 'array.string', label: 'hobbies', default: []},
      {name: 'languages', type: 'array.ref', ref: 'Language', label: 'languages', default: []},
      {
        name: 'address',
        type: 'object',
        label: 'address',
        default: {},
        objectFields: [{name: 'country', type: 'string', label: 'country', default: ''},
          {name: 'city', type: 'string', label: 'city', default: ''},
          {name: 'street', type: 'string', label: 'street', default: ''},
          {name: 'zip', type: 'string', label: 'zip', default: ''}]
      },
      {
        name: 'skills',
        type: 'array.object',
        label: 'skills',
        default: [],
        objectFields: [{name: 'name', type: 'string', label: 'name', default: ''},
          {name: 'level', type: 'number', label: 'level', default: null}]
      }
    ]
  }

  get dialogFullscreen() {
    return false
  }

}

export default PersonCrud

