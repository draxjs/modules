import {EntityCrud, useCrudStore} from "@drax/crud-vue";
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
import CovenantProvider from "../providers/CovenantProvider";
import {useI18n} from 'vue-i18n'

//Import EntityCrud Refs
import {UserCrud} from "@drax/identity-vue"
import GroupZoneCrud from "../cruds/GroupZoneCrud";

class CovenantCrud extends EntityCrud implements IEntityCrud {

  static singleton: CovenantCrud
  private store?: ReturnType<typeof useCrudStore>

  constructor() {
    super();
    this.name = 'Covenant'
  }

  private get crudStore() {
    if (!this.store) {
      this.store = useCrudStore(this.name)
    }
    return this.store
  }

  static get instance(): CovenantCrud {
    if (!CovenantCrud.singleton) {
      CovenantCrud.singleton = new CovenantCrud()
    }
    return CovenantCrud.singleton
  }

  get permissions(): IEntityCrudPermissions {
    return {
      manage: 'covenant:manage',
      view: 'covenant:view',
      create: 'covenant:create',
      update: 'covenant:update',
      delete: 'covenant:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
      {title: 'date', key: 'date', align: 'start'},
      {title: 'locality', key: 'locality', align: 'start'},
      {title: 'address', key: 'address', align: 'start'},
      {title: 'fullname', key: 'fullname', align: 'start'},
      {title: 'dni', key: 'dni', align: 'start'},
      {title: 'Hora', key: 'hora', align: 'start'},
      {title: 'month', key: 'month', align: 'start'},
      {title: 'amount', key: 'amount', align: 'start'},
      {title: 'status', key: 'status', align: 'start'},
      {title: 'group', key: 'group', align: 'start'},
      {title: 'since', key: 'since', align: 'start'},
      {title: 'until', key: 'until', align: 'start'},
      {title: 'createdBy', key: 'createdBy', align: 'start'},
    ]
  }

  get selectedHeaders(): string[] {
    return ['locality', 'address', 'fullname', 'dni', 'hora', 'month', 'amount', 'status']
  }

  get actionHeaders(): IEntityCrudHeader[] {
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

  get provider(): IDraxCrudProvider<any, any, any> {
    return CovenantProvider.instance
  }

  get refs(): IEntityCrudRefs {
    return {
      User: UserCrud.instance,
      Group: GroupZoneCrud.instance,
    }
  }

  get rules(): IEntityCrudRules {
    const {t} = useI18n()

    return {
      date: [(v: never) => !!v || t('validation.required')],
      since: [
        (v: never) => !!v || t('validation.required'),
        (v: never) => /^([0-1][0-9]|2[0-3])$|([0-1][0-9]|^2[0-3]):[0-5][0-9]$/.test(v) || 'Formato: HH o HH:MM'
      ],
      until: [
        (v: never) => !!v || t('validation.required'),
        (v: never) => /^([0-1][0-9]|2[0-3])$|([0-1][0-9]|^2[0-3]):[0-5][0-9]$/.test(v) || 'Formato: HH o HH:MM'
      ],
      month: [
        (v: never) => !!v || t('validation.required'),
        (v: never) => /^ENE$|^FEB$|^MAR$|^ABR$|^MAY$|^JUN$|^JUL$|^AGO$|^SEP$|^OCT$|^NOV$|^DIC$/.test(v) || 'Valores: ENE, FEB, MAR, ABR, MAY, JUN, JUL, AGO, SEP, OCT, NOV, DIC'
      ],
      fullname: [(v: never) => !!v || t('validation.required')],
      dni: [(v: never) => !!v || t('validation.required')],
      locality: [(v: never) => !!v || t('validation.required')],
      address: [(v: never) => !!v || t('validation.required')],
      amount: [(v: never) => !!v || t('validation.required')],
      group: [(v: never) => !!v || t('validation.required')],
    }
  }

  get onInputs() {
    return {
      month: () => {
        const val = this.crudStore.getFieldValue('month').toUpperCase()
        this.crudStore.setFormFieldValue('month', val)
      },
      since: () => {
        let re = /[^0-9:]/g;
        const val = this.crudStore.getFieldValue('since')
        this.crudStore.setFormFieldValue('since', val.replace(re, ''))
      },
      until: () => {
        let re = /[^0-9:]/g;
        const val = this.crudStore.getFieldValue('until')
        this.crudStore.setFormFieldValue('until', val.replace(re, ''))
      },
      dni: () => {
        let re = /[^0-9]/g;
        const val = this.crudStore.getFieldValue('dni')
        this.crudStore.setFormFieldValue('dni', val.replace(re, ''))
      },
      amount: () => {
        let val = this.crudStore.getFieldValue('amount')
        let re = /[^0-9,.]/g;
        val = val.replace(re, '')
        val = val.replace(',', '.')
        //val = parseFloat(val)
        this.crudStore.setFormFieldValue('amount', val)


      }
    }
  }

  get fields(): IEntityCrudField[] {
    return [
      {name: 'date', type: 'date', label: 'date', default: new Date((new Date()).setHours(0, 0, 0, 0)), md: 6},
      {name: 'group', type: 'ref', label: 'group', default: null, ref: 'Group', refDisplay: 'name', md: 6, noFilter: true},
      {name: 'createdBy', type: 'ref', label: 'createdBy', default: null, ref: 'User', refDisplay: 'username', md: 6},
      {name: 'locality', type: 'string', label: 'locality', default: '', md: 6},
      {name: 'address', type: 'string', label: 'address', default: '', md: 6},
      {name: 'since', type: 'string', label: 'since', default: '', md: 6},
      {name: 'until', type: 'string', label: 'until', default: '', md: 6},

      {name: 'fullname', type: 'string', label: 'fullname', default: '', md: 6},
      {name: 'dni', type: 'string', label: 'dni', default: '', md: 6},
      {name: 'month', type: 'string', label: 'month', default: '', md: 6},
      {name: 'amount', type: 'string', label: 'amount', default: null, md: 6},
      {name: 'comment', type: 'string', label: 'comment', default: '', md: 12},
      //{name: 'link', type: 'string', label: 'link', default: ''},
      //{name: 'status', type: 'string', label: 'status', default: ''},
    ]
  }

  get createFields(){
    return this.fields.filter(field => field.name !== 'createdBy')
  }

  get updateFields(){
    return this.fields.filter(field => field.name !== 'createdBy')
  }

  get filters(): IEntityCrudFilter[] {
    return [
      {
        name: 'date',
        type: 'date',
        label: 'date',
        default: new Date((new Date()).setHours(0, 0, 0, 0)),
        md: 6,
        operator: 'eq'
      },
      {
        name: 'group',
        type: 'ref',
        label: 'group',
        default: null,
        ref: 'Group',
        refDisplay: 'name',
        md: 6,
        operator: 'in'
      },
      {
        name: 'createdBy',
        type: 'ref',
        label: 'createdBy',
        default: null,
        ref: 'User',
        refDisplay: 'username',
        md: 6,
        operator: 'in'
      },
      {name: 'locality', type: 'string', label: 'locality', default: '', md: 6, operator: 'like'},
      {name: 'address', type: 'string', label: 'address', default: '', md: 6, operator: 'like'},
      {name: 'fullname', type: 'string', label: 'fullname', default: '', md: 6, operator: 'like'},
      {name: 'dni', type: 'string', label: 'dni', default: '', md: 6, operator: 'eq'},

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
    return this.headers.map(i => i.key)
  }

  get isImportable() {
    return false
  }

  get isColumnSelectable() {
    return true
  }

  get isGroupable() {
    return true
  }

  get importFormats() {
    return ['CSV', 'JSON']
  }

  get dialogFullscreen() {
    return false
  }

  get tabs() {
    return []
  }

  get menus() {
    return []
  }

  get searchEnable() {
    return false
  }

}

export default CovenantCrud
