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
import {UserSessionSystemFactory} from "@drax/identity-front";

//Import EntityCrud Refs
import {UserCrud} from "@drax/identity-vue"

class UserSessionCrud extends EntityCrud implements IEntityCrud {

    static singleton: UserSessionCrud

    constructor() {
        super();
        this.name = 'UserSession'
    }

    static get instance(): UserSessionCrud {
        if (!UserSessionCrud.singleton) {
            UserSessionCrud.singleton = new UserSessionCrud()
        }
        return UserSessionCrud.singleton
    }

    get permissions(): IEntityCrudPermissions {
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
            {title: 'uuid', key: 'uuid', align: 'start'},
            {title: 'user', key: 'user', align: 'start'},
            {title: 'agent', key: 'agent', align: 'start'},
            {title: 'ip', key: 'ip', align: 'start'},
            {title: 'createdAt', key: 'createdAt', align: 'start'}
        ]
    }

    get selectedHeaders(): string[] {
        return this.headers.map(header => header.key)
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
        return UserSessionSystemFactory.getInstance()
    }

    get refs(): IEntityCrudRefs {
        return {
            User: UserCrud.instance
        }
    }

    get rules(): IEntityCrudRules {
        return {
            uuid: [(v: any) => !!v || 'validation.required'],
            user: [(v: any) => !!v || 'validation.required'],
            agent: [],
            ip: [],
            createdAt: []
        }
    }

    get fields(): IEntityCrudField[] {
        return [
            {name: 'uuid', type: 'string', label: 'uuid', default: ''},
            {name: 'user', type: 'ref', label: 'user', default: null, ref: 'User', refDisplay: 'username'},
            {name: 'agent', type: 'string', label: 'agent', default: ''},
            {name: 'ip', type: 'string', label: 'ip', default: ''},
            {name: 'createdAt', type: 'date', label: 'createdAt', default: null}
        ]
    }

    get filters(): IEntityCrudFilter[] {
        return [
            {name: 'createdAt', type: 'date', label: 'createdAt', default: '', operator: 'gte' },
            {name: 'createdAt', type: 'date', label: 'createdAt', default: '', operator: 'lte' },
            {name: 'user', type: 'ref',  ref: 'User', refDisplay:"username", label: 'User', default: '', operator: 'eq' },
            {name: 'userAgent', type: 'string', label: 'userAgent', default: '', operator: 'eq' },
            {name: 'ip', type: 'string', label: 'ip', default: '', operator: 'eq' },

        ]
    }

    get searchEnable(){
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
        return ['_id','user','createdAt','userAgent','ip']
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

export default UserSessionCrud

