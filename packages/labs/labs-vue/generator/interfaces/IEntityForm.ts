interface IEntityFormField {
  name: string
  label: string
  type: string
  required: boolean
  readonly : boolean
}

interface IEntityForm{
  name: string
  fields: IEntityFormField[]
}

export type {
  IEntityFormField,
  IEntityForm
}
