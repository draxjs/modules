import type {IGqlClient} from '@drax/common-front'
import type {ISettingProvider} from "../../interfaces/ISettingProvider.ts";
import type {ISetting} from "@drax/settings-share";


class SettingGqlProvider implements ISettingProvider {

    httpClient: IGqlClient

    constructor(httpClient: IGqlClient) {
        this.httpClient = httpClient
    }


    async fetchAll(): Promise<ISetting[]> {
        throw new Error('SettingGqlProvider.fetchAll Not implemented')
    }

    async findByKey(key:string): Promise<ISetting> {
        throw new Error('SettingGqlProvider.findByKey Not implemented')
    }

    async updateValue(id: string, value: string): Promise<ISetting> {
        throw new Error('SettingGqlProvider.updateValue Not implemented')
    }


}

export default SettingGqlProvider
export {SettingGqlProvider}
