

interface ISettingBase{
    id?: string
    name: string
    value: string
    type: "string" | "number" | "boolean" | "entity"
    multiple: boolean
    obfuscate: boolean
    category: string
    options?: string[] | number[]
    regexValidation?: string
    prefix?: string
    suffix?: string
    entity?: string
    entityText?: string
    entityValue?: string
}

interface ISetting{
    id: string
    name: string
    value: string
    type: "string" | "number" | "boolean" | "entity"
    multiple: boolean
    obfuscate: boolean
    category: string
    options?: string[] | number[]
    regexValidation?: string
    prefix?: string
    suffix?: string
    entity?: string
    entityText?: string
    entityValue?: string
}


export {ISetting, ISettingBase}
