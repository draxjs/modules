type SettingTypes = 'string' | 'longString' | 'number' | 'enum' | 'boolean' | 'password' |'stringList' | 'numberList' | 'enumList' |'ref' |'secret'
type SettingValue = string | string[] | number | number[] | boolean

interface ISettingBase{
    _id?: string
    id?: string
    key: string
    value: SettingValue
    //valueList?: string[]
    label: string
    description?: string
    category: string
    type: SettingTypes
    options?: string[]
    regex?: string
    entity?: string
    entityValue?: string
    entityText?: string
    prefix?: string
    suffix?: string
    public?: boolean
    permission?: string
    updatedAt?: string
    updatedBy?: string
}

interface ISetting{
    _id: string
    id?: string
    key: string
    value: SettingValue
    //valueList?: string[]
    label: string
    description?: string
    category: string
    type: SettingTypes
    options?: string[]
    regex?: string
    entity?: string
    entityValue?: string
    entityText?: string
    prefix?: string
    suffix?: string
    public?: boolean
    permission?: string
    updatedAt?: string
    updatedBy?: string
}


export type { ISetting, ISettingBase, SettingTypes, SettingValue }
