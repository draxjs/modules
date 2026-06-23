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
        const normalizeRangeValue = (value: any) => {
            if (!value || typeof value !== 'object' || Array.isArray(value)) {
                return {from: null, to: null}
            }

            return {
                from: value.from ?? null,
                to: value.to ?? null
            }
        }
        const expandRangeFilters = (sourceFilters: IDraxFieldFilter[]) => {
            return sourceFilters.flatMap((filter: IDraxFieldFilter) => {
                if (filter.operator !== 'range') {
                    return [filter]
                }

                const rangeValue = normalizeRangeValue(filter.value)
                const expandedFilters: IDraxFieldFilter[] = []

                if (rangeValue.from !== null && rangeValue.from !== undefined && rangeValue.from !== '') {
                    expandedFilters.push({
                        field: filter.field,
                        operator: 'gte',
                        value: rangeValue.from,
                        orGroup: filter.orGroup
                    })
                }

                if (rangeValue.to !== null && rangeValue.to !== undefined && rangeValue.to !== '') {
                    expandedFilters.push({
                        field: filter.field,
                        operator: 'lte',
                        value: rangeValue.to,
                        orGroup: filter.orGroup
                    })
                }

                return expandedFilters
            })
        }

        return expandRangeFilters(filters)
            .filter((filter: IDraxFieldFilter) => filter.operator === 'empty' || (filter.value !== null && filter.value !== '' && filter.value !== undefined))
            .map((filter: IDraxFieldFilter) => {
                let value = isDate(filter.value)? filter.value.toISOString() : (Array.isArray(filter.value) ? filter.value.join(',') : filter.value)
                const baseFilter = `${filter.field};${filter.operator ? filter.operator : 'eq'};${value}`
                return filter.orGroup ? `${baseFilter};${filter.orGroup}` : baseFilter
            })
            .join('|')
    }




}

export {AbstractBaseRestProvider}
export default AbstractBaseRestProvider
