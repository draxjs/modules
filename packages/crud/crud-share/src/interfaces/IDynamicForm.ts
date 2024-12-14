
interface IDynamicFormBase {
    identifier: string
    fields: Array<{
    type: string
    name: string
    default: string
    required: boolean
    validationRegex: string
    enum: Array<string>
    schema: {    type: string
    name: string
    default: string
    required: boolean
    validationRegex: string
    enum: Array<string>}
    }>
    createdAt?: Date
    updatedAt?: Date
}

interface IDynamicForm {
    id: string
    identifier: string
    fields: Array<{
    type: string
    name: string
    default: string
    required: boolean
    validationRegex: string
    enum: Array<string>
    schema: {    type: string
    name: string
    default: string
    required: boolean
    validationRegex: string
    enum: Array<string>}
    }>
    createdAt?: Date
    updatedAt?: Date
}

export type {
IDynamicFormBase, 
IDynamicForm
}
