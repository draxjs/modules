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
import {AuditProvider} from "@drax/audit-front";

//Import EntityCrud Refs

class AuditCrud extends EntityCrud implements IEntityCrud {

    static singleton: AuditCrud

    constructor() {
        super();
        this.name = 'Audit'
    }

    static get instance(): AuditCrud {
        if (!AuditCrud.singleton) {
            AuditCrud.singleton = new AuditCrud()
        }
        return AuditCrud.singleton
    }

    get permissions(): IEntityCrudPermissions {
        return {
            manage: 'audit:manage',
            view: 'audit:view',
            create: 'audit:create',
            update: 'audit:update',
            delete: 'audit:delete'
        }
    }

    get headers(): IEntityCrudHeader[] {
        return [
            {title: 'createdAt',key:'createdAt', align: 'start'},
            {title: 'action',key:'action', align: 'start'},
            {title: 'entity',key:'entity', align: 'start'},
            {title: 'tenant',key:'tenant', align: 'start'},
            {title: 'user',key:'user', align: 'start'},
            {title: 'ip',key:'ip', align: 'start'},
            {title: 'userAgent',key:'userAgent', align: 'start'},
            {title: 'changes',key:'changes', align: 'start'},
            {title: 'sessionId',key:'sessionId', align: 'start'},
            {title: 'requestId',key:'requestId', align: 'start'},
            {title: 'detail',key:'detail', align: 'start'}
        ]
    }

    get selectedHeaders(): string[] {
        return this.headers
            .filter(header => ['detail','sessionId','requestId','userAgent','ip'].includes(header.key))
            .map(header => header.key)

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
        return AuditProvider.instance
    }

    get refs(): IEntityCrudRefs {
        return {}
    }

    get rules(): IEntityCrudRules {
        return {
            entity: [(v: any) => !!v || 'validation.required'],
            user: [(v: any) => !!v || 'validation.required'],
            action: [(v: any) => !!v || 'validation.required'],
            ip: [(v: any) => !!v || 'validation.required'],
            userAgent: [(v: any) => !!v || 'validation.required'],
            changes: [],
            sessionId: [],
            requestId: [],
            detail: [],
            tenant: []
        }
    }

    get fields(): IEntityCrudField[] {
        return [
            {name: 'action', type: 'string', label: 'action', default: ''},
            {name: 'entity', type: 'string', label: 'entity', default: ''},
            {
                name: 'user',
                type: 'object',
                label: 'user',
                refDisplay:'username',
                default: {"id": "''", "username": "''", "rolName": "''"},
                objectFields: [{name: 'id', type: 'string', label: 'id', default: ''},
                    {name: 'username', type: 'string', label: 'username', default: ''},
                    {name: 'rolName', type: 'string', label: 'rolName', default: ''}]
            },
            {name: 'ip', type: 'string', label: 'ip', default: ''},
            {name: 'userAgent', type: 'string', label: 'userAgent', default: ''},
            {
                name: 'changes',
                type: 'array.object',
                label: 'changes',
                default: [],
                objectFields: [{name: 'field', type: 'string', label: 'field', default: ''},
                    {name: 'old', type: 'string', label: 'old', default: ''},
                    {name: 'new', type: 'string', label: 'new', default: ''}]
            },
            {name: 'sessionId', type: 'string', label: 'sessionId', default: ''},
            {name: 'requestId', type: 'string', label: 'requestId', default: ''},
            {name: 'detail', type: 'longString', label: 'detail', default: ''},
            {
                name: 'tenant',
                type: 'object',
                label: 'tenant',
                default: {"id": "''", "name": "''"},
                objectFields: [{name: 'id', type: 'string', label: 'id', default: ''},
                    {name: 'name', type: 'string', label: 'name', default: ''}]
            }
        ]
    }

    get filters(): IEntityCrudFilter[] {
        return [
            //{name: '_id', type: 'string', label: 'ID', default: '', operator: 'eq' },
            {name: 'action', type: 'string', label: 'action', default: '', operator: 'eq'},
            {name: 'entity', type: 'string', label: 'entity', default: '', operator: 'eq'},
            {name: 'tenant.name', type: 'string', label: 'tenant', default: '', operator: 'eq'},
            {
                name: 'user.username',
                type: 'string',
                label: 'Username',
                default: '',
                operator:'eq'
            },
            {name: 'ip', type: 'string', label: 'ip', default: '', operator: 'eq'},
            {name: 'userAgent', type: 'string', label: 'userAgent', default: '', operator: 'eq'},
        ]
    }

    get searchEnable() {
        return false
    }

    get isViewable() {
        return true
    }

    get isEditable() {
        return false
    }

    get isCreatable() {
        return false
    }

    get isDeletable() {
        return false
    }

    get isExportable() {
        return true
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


}

export default AuditCrud

