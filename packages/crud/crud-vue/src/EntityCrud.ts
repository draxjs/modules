import type {IDraxCrud} from "@drax/common-share";
import type {
  IFields,
  ICrudForm,
  ICrudHeaders,
  ICrudPermissions,
  ICrudRules,
  ICrudField
} from "./interfaces/IEntityCrud";



class EntityCrud{

  name: string = ''

  constructor() {
  }

  static get instance(){
    throw new Error('EntityCrud instance not found')
  }


  get headers():ICrudHeaders[]{
    return [
      {title: 'ID',key:'_id'},
    ]
  }

  get permissions(): ICrudPermissions {
    return {
      manage: 'manage', view: 'view', create: 'create',  update: 'update', delete: 'delete'
    }
  }

  get provider(): IDraxCrud<any, any, any>{
    throw new Error('provider not implemented')
  }

  get fields():IFields{
    return [
      {name: 'id', type: 'string', label: 'ID', default: '' },
    ]
  }

  get form():ICrudForm{

    function objectFields(field:ICrudField){
      let value:any = {}
      if(field.objectFields){
        field.objectFields.forEach(subField => {
          if(subField.type === 'object'){
            value[subField.name] = objectFields(subField)
          }else{
            value[subField.name] = subField.default
          }

        })
      }
      return value
    }

    const form = this.fields.reduce((acc, field) => {

      let value = null
      if(field.type === 'object'){
        value = objectFields(field)
      } else if(field.default != undefined){
        value = field.default
      }

      return {...acc, [field.name]: value }
    }, {})

    console.log("Form: ", form)

    return form

  }

  get refs():{ [key: string]: EntityCrud }{
    return {}
  }

  getRef(ref: string):EntityCrud{
    if(!this.refs.hasOwnProperty(ref))  {
      throw new Error("Ref not found: " + ref)
    }

    return this.refs[ref] as EntityCrud
  }

  get rules(): ICrudRules{
    return {}
  }

  get rule()  {
    return (field:string) => this.rules[field] || []
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

  get dialogFullscreen(){
    return false
  }




}

export default EntityCrud;
export { EntityCrud }
