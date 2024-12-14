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

import {DynamicFormProvider} from "@drax/dynamic-front";

//Import EntityCrud Refs


class DynamicFormCrud extends EntityCrud implements IEntityCrud {

    static singleton: DynamicFormCrud

    constructor() {
        super();
        this.name = 'DynamicForm'
    }

    static get instance(): DynamicFormCrud {
        if (!DynamicFormCrud.singleton) {
            DynamicFormCrud.singleton = new DynamicFormCrud()
        }
        return DynamicFormCrud.singleton
    }

    get permissions(): IEntityCrudPermissions {
        return {
            manage: 'dynamicform:manage',
            view: 'dynamicform:view',
            create: 'dynamicform:create',
            update: 'dynamicform:update',
            delete: 'dynamicform:delete'
        }
    }

    get headers(): IEntityCrudHeader[] {
        return [
            {title: 'identifier', key: 'identifier', align: 'start'}
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
        return DynamicFormProvider.instance
    }

    get refs(): IEntityCrudRefs {
        return {}
    }

    get rules(): IEntityCrudRules {
        return {
            identifier: [(v: any) => !!v || 'validation.required'],
            fields: []
        }
    }

    get fields(): IEntityCrudField[] {
        return [
            {name: 'identifier', type: 'string', label: 'identifier', default: ''},
            {
                name: 'fields', type: 'array.object', label: 'fields', default: [],
                objectFields: [
                    {name: 'name', type: 'string', label: 'name', default: ''},
                    {
                        name: 'type',
                        type: 'enum',
                        enum: ['string', 'longString', 'number', 'boolean', 'date', 'object', 'ref', 'enum', 'password', 'file', 'array.string', 'array.number', 'array.object', 'array.ref', 'array.enum', 'array.file'],
                        label: 'type',
                        default: null
                    },
                    {name: 'required', type: 'boolean', label: 'required', default: false},
                    {name: 'default', type: 'string', label: 'default', default: ''},
                    {name: 'validationRegex', type: 'string', label: 'validationRegex', default: ''},
                    {name: 'options', type: 'array.string', label: 'options', default: []},
                ]
            }
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
        return ['_id']
    }

    get isImportable() {
        return true
    }

    get importFormats() {
        return ['CSV', 'JSON']
    }

    get dialogFullscreen() {
        return false
    }

}

export default DynamicFormCrud

