import {HttpRestClientFactory} from "@drax/common-front";
import type {IHttpClient} from '@drax/common-front'
import type {
    IDraxFieldFilter,
} from "@drax/crud-share";


class AbstractBaseRestProvider {

    httpClient: IHttpClient
    basePath: string = '/api/entity'

    constructor(basePath: string = '/api/entity') {
        this.httpClient = HttpRestClientFactory.getInstance()
        this.setBasePath(basePath)
    }

    setBasePath(basePath: string) {
        this.basePath = basePath
    }


    prepareFilters(filters: IDraxFieldFilter[]) {
        const isDate = (value: any): value is Date => value instanceof Date;

        return filters
            .filter((filter: IDraxFieldFilter) => filter.value !== null && filter.value !== '' && filter.value !== undefined)
            .map((filter: IDraxFieldFilter) => {
                let value = isDate(filter.value)? filter.value.toISOString() : (Array.isArray(filter.value) ? filter.value.join(',') : filter.value)
                return `${filter.field};${filter.operator ? filter.operator : 'eq'};${value}`
            })
            .join('|')
    }




}

export {AbstractBaseRestProvider}
export default AbstractBaseRestProvider
