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
import {FileSystemFactory} from "@drax/media-front";

//Import EntityCrud Refs


class FileEntityCrud extends EntityCrud implements IEntityCrud {

    static singleton: FileEntityCrud

    constructor() {
        super();
        this.name = 'File'
    }

    static get instance(): FileEntityCrud {
        if (!FileEntityCrud.singleton) {
            FileEntityCrud.singleton = new FileEntityCrud()
        }
        return FileEntityCrud.singleton
    }

    get permissions(): IEntityCrudPermissions {
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
            {title: 'filename', key: 'filename', align: 'start'},
            {title: 'url', key: 'url', align: 'start'},
            {title: 'mimetype', key: 'mimetype', align: 'start'},
            {title: 'extension', key: 'extension', align: 'start'},
            {title: 'size', key: 'size', align: 'start'},
            {title: 'type', key: 'type', align: 'start'},
            {title: 'createdAt', key: 'createdAt', align: 'start'},
            {title: 'createdBy', key: 'createdBy.username', align: 'start'},
            {title: 'lastAccess', key: 'lastAccess', align: 'start'},
            {title: 'ttlSeconds', key: 'ttlSeconds', align: 'start'},
            {title: 'expiresAt', key: 'expiresAt', align: 'start'},
            // {title: 'isPublic', key: 'isPublic', align: 'start'},
            {title: 'hits', key: 'hits', align: 'start'},
            {title: 'updatedAt', key: 'updatedAt', align: 'start'},
            {title: 'updatedBy', key: 'updatedBy.username', align: 'start'},
        ]
    }

    get selectedHeaders(): string[] {
        return ['filename', 'mimetype', 'extension', 'size', 'createdAt','createdBy.username','lastAccess','hits'];
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
        return FileSystemFactory.getInstance()
    }

    get refs(): IEntityCrudRefs {
        return {}
    }

    get rules(): IEntityCrudRules {
        return {
        }
    }

    get fields(): IEntityCrudField[] {
        return [




            {name: 'filename', type: 'string', label: 'filename', default: '', readonly: true},
            {name: 'url', type: 'string', label: 'url', default: '', readonly: true},
            {name: 'mimetype', type: 'string', label: 'mimetype', default: '', readonly: true},
            {name: 'encoding', type: 'string', label: 'encoding', default: '', readonly: true},
            {name: 'extension', type: 'string', label: 'extension', default: '', readonly: true},
            {name: 'size', type: 'number', label: 'size', default: null, readonly: true},
            {name: 'type', type: 'string', label: 'type', default: '', readonly: true},

            {name: 'description', type: 'longString', label: 'description', default: ''},
            {name: 'tags', type: 'array.string', label: 'tags', default: []},
            {name: 'createdFor', type: 'string', label: 'createdFor', default: ''},
            {name: 'isPublic', type: 'boolean', label: 'isPublic', default: true},

            {name: 'ttlSeconds', type: 'number', label: 'ttlSeconds', default: null},
            {name: 'expiresAt', type: 'date', label: 'expiresAt', default: null},

            {name: 'lastAccess', type: 'date', label: 'lastAccess', default: null, readonly: true},
            {name: 'createdAt', type: 'date', label: 'createdAt', default: null, readonly: true},
            {name: 'updatedAt', type: 'date', label: 'updatedAt', default: null, readonly: true},
            {
                name: 'createdBy',
                type: 'object',
                label: 'createdBy',
                default: {"id": "''", "username": "''"},
                objectFields: [
                    {name: 'id', type: 'string', label: 'id', default: '', readonly: true},
                    {name: 'username', type: 'string', label: 'username', default: '', readonly: true}
                ]
            },
            {
                name: 'updatedBy',
                type: 'object',
                label: 'updatedBy',
                default: {"id": "''", "username": "''"},
                objectFields: [
                    {name: 'id', type: 'string', label: 'id', default: '', readonly: true},
                    {name: 'username', type: 'string', label: 'username', default: '', readonly: true}
                ]
            },



            {name: 'hits', type: 'number', label: 'hits', default: 0, readonly: true}
        ]
    }

    get filters(): IEntityCrudFilter[] {
        return [
            //{name: '_id', type: 'string', label: 'ID', default: '', operator: 'eq' },
        ]
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
        return true
    }

    get isExportable() {
        return true
    }

    get exportFormats() {
        return ['CSV', 'JSON']
    }

    get exportHeaders() {
        return ['filename', 'mimetype', 'extension', 'size', 'createdAt','createdBy.username','lastAccess','hits']
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
        return true
    }

    get filtersEnable() {
        return true
    }

    get dynamicFiltersEnable() {
        return true
    }

    get containerFluid(){
        return true
    }


}

export default FileEntityCrud

