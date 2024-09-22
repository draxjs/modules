interface ICrudHeaders {
  title: string
  key: string
}

interface ICrudRules {
  [key: string]: Array<Function>
}

interface ICrudField {
  name: string
  type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'ref' | 'array.string' | 'array.number' | 'array.object' | 'array.ref'
  ref?: string
  objectFields?: ICrudField[]
  label: string,
  default: any
}

interface ICrudForm {
  [key: string]: string | number | boolean | Date | null
}

type IFields = ICrudField[]

interface ICrudPermissions {
  manage: string
  view: string
  create: string
  update: string
  delete: string
}

export type {ICrudHeaders, ICrudRules, ICrudField, IFields, ICrudForm, ICrudPermissions}
