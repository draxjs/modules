import type {IHttpClient} from '@drax/common-front'
import type {ISettingProvider} from "../../interfaces/ISettingProvider.ts";
import type {ISetting} from "@drax/settings-share";


class SettingRestProvider implements ISettingProvider {

    httpClient: IHttpClient

    constructor(httpClient: IHttpClient) {
        this.httpClient = httpClient
    }


    async fetchAll(): Promise<ISetting[]> {
        const url = '/api/settings'
        let settings = await this.httpClient.get(url)
        return settings as ISetting[]
    }

    async fetchGrouped(): Promise<{ [key: string]: ISetting[] }> {
        const url = '/api/settings/grouped'
        let settings = await this.httpClient.get(url)
        return settings as { [key: string]: ISetting[] }
    }

    async findByKey(key:string): Promise<ISetting> {
        const url = '/api/settings/'+key
        let settings = await this.httpClient.get(url)
        return settings as ISetting
    }

    async updateValue(id: string, value: string): Promise<ISetting> {
        const url = '/api/settings/' + id
        let setting = await this.httpClient.patch(url, {value})
        return setting as ISetting
    }


}

export default SettingRestProvider
export {SettingRestProvider}
