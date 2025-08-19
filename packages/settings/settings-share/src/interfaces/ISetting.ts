type SettingTypes = 'string' | 'longString' | 'number' | 'enum' | 'boolean' | 'password' |'stringList' | 'numberList' | 'enumList' |'ref' |'secret'

interface ISettingBase{
    _id?: string
    id?: string
    key: string
    value: string
    //valueList?: string[]
    label: string
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
}

interface ISetting{
    _id: string
    id?: string
    key: string
    value: string
    //valueList?: string[]
    label: string
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
}


export type { ISetting, ISettingBase, SettingTypes }
