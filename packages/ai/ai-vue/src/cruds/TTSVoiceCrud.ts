import {EntityCrud} from "@drax/crud-vue";
import type {
  IDraxCrudProvider,
  IEntityCrud,
  IEntityCrudField,
  IEntityCrudFilter,
  IEntityCrudHeader,
  IEntityCrudOperation,
  IEntityCrudPermissions,
  IEntityCrudRefs,
  IEntityCrudRules
} from "@drax/crud-share";
import {TTSVoiceProvider} from "@drax/ai-front";
import {TenantCrud, UserCrud} from "@drax/identity-vue"

class TTSVoiceCrud extends EntityCrud implements IEntityCrud {

  static singleton: TTSVoiceCrud

  constructor() {
    super();
    this.name = 'TTSVoice'
  }

  static get instance(): TTSVoiceCrud {
    if (!TTSVoiceCrud.singleton) {
      TTSVoiceCrud.singleton = new TTSVoiceCrud()
    }
    return TTSVoiceCrud.singleton
  }

  get permissions(): IEntityCrudPermissions {
    return {
      manage: 'ttsvoice:manage',
      view: 'ttsvoice:view',
      create: 'ttsvoice:create',
      update: 'ttsvoice:update',
      delete: 'ttsvoice:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
      {title: 'name', key: 'name', align: 'start'},
      {title: 'ttsProvider', key: 'ttsProvider', align: 'start'},
      {title: 'voiceId', key: 'voiceId', align: 'start'},
      {title: 'model', key: 'model', align: 'start'},
      {title: 'languageCode', key: 'languageCode', align: 'start'},
      {title: 'tenant', key: 'tenant', align: 'start'},
      {title: 'user', key: 'user', align: 'start'}
    ]
  }

  get selectedHeaders(): string[] {
    return ['name', 'ttsProvider', 'voiceId', 'model', 'languageCode']
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
    return TTSVoiceProvider.instance
  }

  get refs(): IEntityCrudRefs {
    return {
      Tenant: TenantCrud.instance,
      User: UserCrud.instance
    }
  }

  get rules(): IEntityCrudRules {
    return {
      name: [(v: any) => !!v || 'validation.required'],
      ttsProvider: [(v: any) => !!v || 'validation.required'],
      voiceId: [(v: any) => !!v || 'validation.required'],
      model: [],
      languageCode: [],
      tenant: [],
      user: []
    }
  }

  get fields(): IEntityCrudField[] {
    return [
      {name: 'name', type: 'string', label: 'name', default: '', groupTab: 'BASIC'},
      {
        name: 'ttsProvider',
        type: 'enum',
        label: 'ttsProvider',
        default: 'ElevenLabs',
        enum: ['ElevenLabs'],
        groupTab: 'BASIC'
      },
      {name: 'voiceId', type: 'string', label: 'voiceId', default: '', groupTab: 'BASIC'},
      {name: 'model', type: 'string', label: 'model', default: '', groupTab: 'ADVANCED'},
      {name: 'languageCode', type: 'string', label: 'languageCode', default: 'es', groupTab: 'ADVANCED'},
      {name: 'tenant', type: 'ref', label: 'tenant', default: null, groupTab: 'MANAGE', ref: 'Tenant', refDisplay: 'name'},
      {name: 'user', type: 'ref', label: 'user', default: null, groupTab: 'MANAGE', ref: 'User', refDisplay: 'username'}
    ]
  }

  get filters(): IEntityCrudFilter[] {
    return [
      {name: 'name', type: 'string', label: 'name', default: null, operator: 'like'},
      {name: 'ttsProvider', type: 'enum', label: 'ttsProvider', default: null, operator: 'eq', enum: ['ElevenLabs']},
      {name: 'voiceId', type: 'string', label: 'voiceId', default: null, operator: 'like'}
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
    return ['_id', 'name', 'ttsProvider', 'voiceId', 'model', 'languageCode']
  }

  get isImportable() {
    return true
  }

  get importFormats() {
    return ['CSV', 'JSON']
  }

  get isColumnSelectable() {
    return true
  }

  get isGroupable() {
    return true
  }

  get dialogFullscreen() {
    return false
  }

  get tabs() {
    return ['BASIC', 'ADVANCED', 'MANAGE']
  }

  get searchEnable() {
    return true
  }

  get filtersEnable() {
    return true
  }

  get dynamicFiltersEnable() {
    return true
  }

  get isAiAssistable() {
    return false
  }

  get navigationOperations(): IEntityCrudOperation[] {
    return ['view', 'edit', 'delete']
  }

  get isSavedQueriesEnabled() {
    return true
  }

}

export default TTSVoiceCrud
