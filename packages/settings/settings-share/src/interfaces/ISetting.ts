type SettingTypes = 'string' | 'longString' | 'number' | 'enum' | 'boolean' | 'password' |'stringList' | 'numberList' | 'enumList' |'ref' |'secret'

interface ISettingBase{
    id?: string
    key: string
    value: string
    //valueList?: string[]
    label: string
    group: string
    type: SettingTypes
    options?: string[]
    regex?: string
    entity?: string
    entityValue?: string
    entityText?: string
    prefix?: string
    suffix?: string
}

interface ISetting{
    id: string
    key: string
    value: string
    //valueList?: string[]
    label: string
    group: string
    type: SettingTypes
    options?: string[]
    regex?: string
    entity?: string
    entityValue?: string
    entityText?: string
    prefix?: string
    suffix?: string
}


export type { ISetting, ISettingBase, SettingTypes }
