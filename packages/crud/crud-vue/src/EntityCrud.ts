import type {
  IEntityCrud, IEntityCrudForm, IEntityCrudHeader, IEntityCrudRefs,
  IEntityCrudRules, IEntityCrudField, IEntityCrudPermissions,
  IDraxCrudProvider, IEntityCrudFilter, IEntityCrudFormFilter
} from "@drax/crud-share";



class EntityCrud implements IEntityCrud{

  name: string = ''

  constructor() {
  }

  static get instance():IEntityCrud{
    throw new Error('EntityCrud instance not found')
  }


  get headers():IEntityCrudHeader[]{
    return [
      {title: 'ID',key:'_id'},
    ]
  }

  get permissions(): IEntityCrudPermissions {
    return {
      manage: 'manage', view: 'view', create: 'create',  update: 'update', delete: 'delete'
    }
  }

  get provider(): IDraxCrudProvider<any, any, any>{
    throw new Error('provider not implemented')
  }

  get fields():IEntityCrudField[]{
    return [
      {name: '_id', type: 'string', label: 'ID', default: '' },
    ]
  }

  get createFields(){
    return this.fields
  }

  get updateFields(){
    return this.fields
  }

  get filters():IEntityCrudFilter[]{
    return [
      {name: '_id', type: 'string', label: 'ID', default: '', operator: 'eq' },
    ]
  }

  objectFields(field:IEntityCrudField){
    let value:any = {}
    if(field.objectFields){
      field.objectFields.forEach(subField => {
        if(subField.type === 'object'){
          value[subField.name] = this.objectFields(subField)
        }if(subField.type === 'number' && field.default!= undefined){
          value[subField.name] = null
        }else{
          value[subField.name] = subField.default
        }

      })
    }
    return value
  }

  get form():IEntityCrudForm{

    return this.fields.reduce((acc, field) => {
      let value = null
      if(field.type === 'object'){
        value = this.objectFields(field)
      }else if(field.default != undefined){
        value = field.default
      }else{
        value = null
      }

      return {...acc, [field.name]: value }
    }, {})

  }


  get formFilters():IEntityCrudFormFilter[]{
    return this.filters.map(
        (filter:IEntityCrudFilter) =>
            ({field:filter.name, value: null, operator: filter.operator  })
    )
  }

  get refs():IEntityCrudRefs{
    return {}
  }

  getRef(ref: string):IEntityCrud{
    if(!this.refs.hasOwnProperty(ref))  {
      throw new Error("Ref not found: " + ref)
    }

    return this.refs[ref]
  }

  get rules(): IEntityCrudRules{
    return {}
  }

  getRule(field:string|undefined):Array<Function>|undefined  {
      return field && this.rules[field] && this.rules[field].length > 0 ? this.rules[field] : undefined
  }

  get isViewable(){
    return true
  }

  get isEditable(){
    return true
  }

  get isCreatable(){
    return true
  }

  get isDeletable(){
    return true
  }

  get isExportable(){
    return true
  }

  get exportFormats(){
    return ['CSV', 'JSON']
  }

  get exportHeaders(){
    return ['_id']
  }

  get isImportable(){
    return true
  }

  get importFormats(){
    return ['CSV', 'JSON']
  }

  get dialogFullscreen(){
    return false
  }


}

export default EntityCrud;
export { EntityCrud }
