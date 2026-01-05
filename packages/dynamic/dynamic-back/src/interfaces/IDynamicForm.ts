interface IDynamicFormFieldSchema {
    type: string
    name: string
    default?: string
    required?: boolean
    validationRegex?: string
    options?: Array<string>
    schema?: [IDynamicFormFieldSchema]
}

interface IDynamicFormBase {
    identifier: string
    fields: Array<{
        name: string
        type: string
        default: string
        required: boolean
        validationRegex: string
        options: Array<string>
        schema: [IDynamicFormFieldSchema]
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
        options: Array<string>
        schema: [IDynamicFormFieldSchema]
    }>
    createdAt?: Date
    updatedAt?: Date
}

export type {
    IDynamicFormBase,
    IDynamicForm,
    IDynamicFormFieldSchema
}
