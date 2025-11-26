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
import {DashboardProvider} from "@drax/dashboard-front";
import {useDashboardStore} from "../stores/UseDashboardStore";

//Import EntityCrud Refs


class DashboardCrud extends EntityCrud implements IEntityCrud {

    static singleton: DashboardCrud

    constructor() {
        super();
        this.name = 'Dashboard'
    }

    static get instance(): DashboardCrud {
        if (!DashboardCrud.singleton) {
            DashboardCrud.singleton = new DashboardCrud()
        }
        return DashboardCrud.singleton
    }

    get permissions(): IEntityCrudPermissions {
        return {
            manage: 'dashboard:manage',
            view: 'dashboard:view',
            create: 'dashboard:create',
            update: 'dashboard:update',
            delete: 'dashboard:delete'
        }
    }

    get headers(): IEntityCrudHeader[] {
        return [
            {title: 'identifier', key: 'identifier', align: 'start'},
            {title: 'title', key: 'title', align: 'start'}
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
        return DashboardProvider.instance
    }

    get refs(): IEntityCrudRefs {
        return {}
    }

    get rules(): IEntityCrudRules {
        return {
            identifier: [(v: any) => !!v || 'validation.required'],
            title: [(v: any) => !!v || 'validation.required'],
            cards: []
        }
    }

    get entities(){
        const dashboardStore = useDashboardStore();
        return dashboardStore.entities.map((entity: any) => entity.name)
    }

    get fields(): IEntityCrudField[] {
        return [
            {name: 'identifier', type: 'string', label: 'identifier', default: ''},
            {name: 'title', type: 'string', label: 'title', default: ''},
            {
                name: 'cards',
                type: 'array.object',
                label: 'cards',
                default: [],
                objectFields: [
                    {name: 'title', type: 'string', label: 'title', default: ''},
                    {name: 'entity', type: 'enum', enum: this.entities, label: 'entity', default: ''},
                    {name: 'type', type: 'enum', label: 'type', default: null, enum: ['paginate', 'groupBy']},
                    {
                        name: 'filters',
                        type: 'array.object',
                        label: 'filters',
                        default: [],
                        objectFields: [
                            {name: 'field', type: 'string', label: 'field', default: ''},
                            {name: 'operator', type: 'string', label: 'operator', default: ''},
                            {name: 'value', type: 'string', label: 'value', default: ''}]
                    },
                    {
                        name: 'layout',
                        type: 'object',
                        label: 'layout',
                        default: {"cols": 12, "sm": 12, "md": 12, "lg": 12, "height": 350, "cardVariant": "elevated"},
                        objectFields: [
                            {name: 'cols', type: 'number', label: 'cols', default: 12, sm: 3, md: 3, lg: 3},
                            {name: 'sm', type: 'number', label: 'sm', default: 12, sm: 3, md: 3, lg: 3},
                            {name: 'md', type: 'number', label: 'md', default: 12, sm: 3, md: 3, lg: 3},
                            {name: 'lg', type: 'number', label: 'lg', default: 12, sm: 3, md: 3, lg: 3},
                            {name: 'height', type: 'number', label: 'height', default: 350},
                            {
                                name: 'cardVariant',
                                type: 'enum',
                                label: 'cardVariant',
                                default: 'elevated',
                                enum: ['text', 'flat', 'elevated', 'tonal', 'outlined', 'plain']
                            }]
                    },
                    {
                        name: 'groupBy',
                        type: 'object',
                        label: 'groupBy',
                        default: {"fields": [], "dateFormat": "day", "render": "table"},
                        objectFields: [{name: 'fields', type: 'array.string', label: 'fields', default: []},
                            {
                                name: 'dateFormat',
                                type: 'enum',
                                label: 'dateFormat',
                                default: 'day',
                                enum: ['year', 'month', 'day', 'hour', 'minute', 'second']
                            },
                            {
                                name: 'render',
                                type: 'enum',
                                label: 'render',
                                default: 'table',
                                enum: ['table', 'gallery', 'pie', 'bars']
                            }]
                    },
                    {
                        name: 'paginate',
                        type: 'object',
                        label: 'paginate',
                        default: {"columns": [], "orderBy": "", "order": null},
                        objectFields: [{name: 'columns', type: 'array.string', label: 'columns', default: []},
                            {name: 'orderBy', type: 'string', label: 'orderBy', default: ''},
                            {name: 'order', type: 'enum', label: 'order', default: null, enum: ['asc', 'desc']}]
                    }]
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

export default DashboardCrud

