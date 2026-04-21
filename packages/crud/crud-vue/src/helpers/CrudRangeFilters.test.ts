import {describe, expect, it} from "vitest";
import {
    createCrudFilterValue,
    createEmptyDateRangeValue,
    expandRangeFilters,
    normalizeDateRangeValue
} from "./CrudRangeFilters";

describe('CrudRangeFilters', () => {
    it('creates an empty range value by default', () => {
        expect(createEmptyDateRangeValue()).toEqual({from: null, to: null})
    })

    it('normalizes invalid range values to an empty range', () => {
        expect(normalizeDateRangeValue(null)).toEqual({from: null, to: null})
        expect(normalizeDateRangeValue('2026-01-01')).toEqual({from: null, to: null})
    })

    it('uses an empty object for range filters without default', () => {
        expect(createCrudFilterValue({
            name: 'birthdate',
            type: 'date',
            label: 'birthdate',
            default: undefined,
            operator: 'range'
        })).toEqual({from: null, to: null})
    })

    it('expands range filters into gte and lte filters', () => {
        const from = new Date('2026-01-10T00:00:00.000Z')
        const to = new Date('2026-01-20T00:00:00.000Z')

        expect(expandRangeFilters([{
            field: 'birthdate',
            operator: 'range',
            value: {from, to}
        }])).toEqual([
            {field: 'birthdate', operator: 'gte', value: from},
            {field: 'birthdate', operator: 'lte', value: to}
        ])
    })

    it('omits empty range bounds when expanding', () => {
        expect(expandRangeFilters([{
            field: 'birthdate',
            operator: 'range',
            value: {from: null, to: '2026-01-20'}
        }])).toEqual([
            {field: 'birthdate', operator: 'lte', value: '2026-01-20'}
        ])
    })
})
