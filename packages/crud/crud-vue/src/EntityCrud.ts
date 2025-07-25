import type {
    IEntityCrud, IEntityCrudForm, IEntityCrudHeader, IEntityCrudRefs,
    IEntityCrudRules, IEntityCrudField, IEntityCrudPermissions,
    IDraxCrudProvider, IEntityCrudFilter, IEntityCrudFormFilter
} from "@drax/crud-share";


class EntityCrud implements IEntityCrud {

    name: string = ''

    constructor() {
    }

    static get instance(): IEntityCrud {
        throw new Error('EntityCrud instance not found')
    }


    get headers(): IEntityCrudHeader[] {
        return [
            {title: 'ID', key: '_id'},
        ]
    }

    get actionHeaders(): IEntityCrudHeader[] {
        return [
            {
                title: 'action.actions',
                key: 'actions',
                sortable: false,
                align: 'center',
                minWidth: '190px',
                fixed:  'end'
            },
        ]
    }


    get permissions(): IEntityCrudPermissions {
        return {
            manage: 'manage', view: 'view', create: 'create', update: 'update', delete: 'delete'
        }
    }

    get provider(): IDraxCrudProvider<any, any, any> {
        throw new Error('provider not implemented')
    }

    get fields(): IEntityCrudField[] {
        return [
            {name: '_id', type: 'string', label: 'ID', default: ''},
        ]
    }

    get createFields() {
        return this.fields
    }

    get updateFields() {
        return this.fields
    }

    get deleteFields() {
        return this.fields
    }

    get viewFields() {
        return this.fields
    }

    get filters(): IEntityCrudFilter[] {
        return [
            {name: '_id', type: 'string', label: 'ID', default: '', operator: 'eq'},
        ]
    }

    objectFields(field: IEntityCrudField) {
        let value: any = {}
        if (field.objectFields) {
            field.objectFields.forEach(subField => {

                if (subField.default != undefined) {
                    value[subField.name] = field.default
                } else if (subField.type === 'object') {
                    value[subField.name] = this.objectFields(field)
                } else if (/array/.test(field.type)) {
                    value[subField.name] = []
                } else {
                    value = null
                }

            })
        }
        return value
    }

    get form(): IEntityCrudForm {

        return this.fields.reduce((acc, field) => {
            let value = null
            if (field.default != undefined) {
                value = field.default
            } else if (field.type === 'object') {
                value = this.objectFields(field)
            } else if (/array/.test(field.type)) {
                value = []
            } else {
                value = null
            }

            return {...acc, [field.name]: value}
        }, {})

    }


    get formFilters(): IEntityCrudFormFilter[] {
        return this.filters.map(
            (filter: IEntityCrudFilter) =>
                ({field: filter.name, value: null, operator: (filter.operator ? filter.operator : 'eq' )})
        ) as IEntityCrudFormFilter[]
    }

    get refs(): IEntityCrudRefs {
        return {}
    }

    getRef(ref: string): IEntityCrud {
        if (!this.refs.hasOwnProperty(ref)) {
            throw new Error("Ref not found: " + ref)
        }

        return this.refs[ref]
    }

    get rules(): IEntityCrudRules {
        return {}
    }

    getRule(field: string | undefined): Array<Function> | undefined {
        return field && this.rules[field] && this.rules[field].length > 0 ? this.rules[field] : undefined
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

    get dialogMaxWidth() {
        return ''
    }


    get tabs():string[]{
        return []
    }


    get menus():string[]{
        return []
    }

    get menuMaxHeight(){
        return '300px'
    }

    get dialogZindex() {
        return 1999
    }

    get searchEnable(){
        return true
    }

    get filterButtons(){
        return true
    }

    get containerFluid(){
        return false
    }

    get cardDensity() : 'default' | 'comfortable' | 'compact' {
        return 'default'
    }

    get cardClass() : string {
        return 'rounded-xl'
    }

    get toolbarDensity() : 'default' | 'comfortable' | 'compact' {
        return 'default'
    }

    get toolbarClass() : string {
        return 'bg-primary'
    }

    get tableDensity() : 'default' | 'comfortable' | 'compact' {
        return 'default'
    }

    get headerProps(){
        return { class: 'bg-primary' }
    }

    get tableStriped() : null | 'odd' | 'even' {
        return 'even'
    }

    get footerClass(){
        return 'bg-primary'
    }


}

export default EntityCrud;
export {EntityCrud}
