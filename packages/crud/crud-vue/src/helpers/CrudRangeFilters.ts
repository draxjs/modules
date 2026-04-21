import type {IDraxFieldFilter, IEntityCrudFilter} from "@drax/crud-share";

interface ICrudDateRangeValue {
    from: Date | string | null
    to: Date | string | null
}

function createEmptyDateRangeValue(): ICrudDateRangeValue {
    return {
        from: null,
        to: null
    }
}

function isRangeOperator(filter?: Pick<IEntityCrudFilter, 'operator'> | Pick<IDraxFieldFilter, 'operator'> | null): boolean {
    return filter?.operator === 'range'
}

function normalizeDateRangeValue(value: any): ICrudDateRangeValue {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return createEmptyDateRangeValue()
    }

    return {
        from: value.from ?? null,
        to: value.to ?? null
    }
}

function createCrudFilterValue(filter: IEntityCrudFilter) {
    if (filter.operator === 'range') {
        if (filter.default === undefined) {
            return createEmptyDateRangeValue()
        }

        return normalizeDateRangeValue(filter.default)
    }

    return filter.default !== undefined ? filter.default : null
}

function expandRangeFilters(filters: Array<IDraxFieldFilter | IEntityCrudFilter>): IDraxFieldFilter[] {
    return filters.flatMap((filter) => {
        if (!isRangeOperator(filter)) {
            return [{
                field: 'field' in filter ? filter.field : filter.name,
                operator: filter.operator ? filter.operator : 'eq',
                value: filter.value
            }]
        }

        const rangeValue = normalizeDateRangeValue(filter.value)
        const fieldName = 'field' in filter ? filter.field : filter.name
        const expandedFilters: IDraxFieldFilter[] = []

        if (rangeValue.from !== null && rangeValue.from !== undefined && rangeValue.from !== '') {
            expandedFilters.push({
                field: fieldName,
                operator: 'gte',
                value: rangeValue.from
            })
        }

        if (rangeValue.to !== null && rangeValue.to !== undefined && rangeValue.to !== '') {
            expandedFilters.push({
                field: fieldName,
                operator: 'lte',
                value: rangeValue.to
            })
        }

        return expandedFilters
    })
}

export {
    createCrudFilterValue,
    createEmptyDateRangeValue,
    expandRangeFilters,
    isRangeOperator,
    normalizeDateRangeValue
}

export type {ICrudDateRangeValue}
