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
import {UserLoginFailSystemFactory} from "@drax/identity-front";

//Import EntityCrud Refs
import {UserCrud} from "@drax/identity-vue"

class UserLoginFailCrud extends EntityCrud implements IEntityCrud {

    static singleton: UserLoginFailCrud

    constructor() {
        super();
        this.name = 'UserLoginFail'
    }

    static get instance(): UserLoginFailCrud {
        if (!UserLoginFailCrud.singleton) {
            UserLoginFailCrud.singleton = new UserLoginFailCrud()
        }
        return UserLoginFailCrud.singleton
    }

    get permissions(): IEntityCrudPermissions {
        return {
            manage: 'userloginfail:manage',
            view: 'userloginfail:view',
            create: 'userloginfail:create',
            update: 'userloginfail:update',
            delete: 'userloginfail:delete'
        }
    }

    get headers(): IEntityCrudHeader[] {
        return [
            {title: 'username', key: 'username', align: 'start'},
            {title: 'userAgent', key: 'userAgent', align: 'start'},
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
        return UserLoginFailSystemFactory.getInstance()
    }

    get refs(): IEntityCrudRefs {
        return {
            User: UserCrud.instance
        }
    }

    get rules(): IEntityCrudRules {
        return {
            user: [(v: any) => !!v || 'validation.required'],
            agent: [],
            ip: [],
            createdAt: []
        }
    }

    get fields(): IEntityCrudField[] {
        return [
            {name: 'username', type: 'string', label: 'username', default: null},
            {name: 'userAgent', type: 'string', label: 'userAgent', default: ''},
            {name: 'ip', type: 'string', label: 'ip', default: ''},
            {name: 'createdAt', type: 'date', label: 'createdAt', default: null}
        ]
    }

    get filters(): IEntityCrudFilter[] {
        return [
            {name: 'createdAt', type: 'date', label: 'createdAt', default: '', operator: 'gte' },
            {name: 'createdAt', type: 'date', label: 'createdAt', default: '', operator: 'lte' },
            {name: 'username', type: 'string', label: 'username', default: '', operator: 'eq' },
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
        return ['_id','username','createdAt','userAgent','ip']
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

export default UserLoginFailCrud

