import type {ISetting} from "@drax/settings-share";

interface ISettingProvider  {
    fetchAll(): Promise<ISetting[]>
    fetchGrouped(): Promise<{ [key: string]: ISetting[] }>
    findByKey(key:string): Promise<ISetting>
    updateValue(id: string, value: string): Promise<ISetting>
}

export type {ISettingProvider}
