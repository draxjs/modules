import z from "zod";
import type {IQueryFilter} from "../interfaces/IQueryFilter";

class SqlQueryFilter {

    static applyFilters(
        where: string = "",
        filters: IQueryFilter[]
    ): { where: string, params: any[] } {

        if (!filters || filters.length === 0) {
            return { where, params: [] }
        }

        this.assertFiltersSchema(filters)

        let params: any[] = []
        let whereFilters: string[] = []

        for (const filter of filters) {

            if ((filter.value === undefined || filter.value === null) && filter.operator !== 'empty') {
                continue
            }

            switch (filter.operator) {

                case 'like':
                    whereFilters.push(`${filter.field} LIKE ?`)
                    params.push(`%${filter.value}%`)
                    break

                case 'eq':
                    whereFilters.push(`${filter.field} = ?`)
                    params.push(filter.value)
                    break

                case 'ne':
                    whereFilters.push(`${filter.field} != ?`)
                    params.push(filter.value)
                    break

                case 'empty':
                    whereFilters.push(`(${filter.field} IS NULL OR ${filter.field} = '')`)
                    break

                case 'in':
                    if (!Array.isArray(filter.value)) {
                        filter.value = filter.value.split(',').map((v: string) => v.trim())
                    }

                    const inPlaceholders = filter.value.map(() => '?').join(',')
                    whereFilters.push(`${filter.field} IN (${inPlaceholders})`)
                    params.push(...filter.value)
                    break

                case 'nin':
                    if (!Array.isArray(filter.value)) {
                        filter.value = filter.value.split(',').map((v: string) => v.trim())
                    }

                    const ninPlaceholders = filter.value.map(() => '?').join(',')
                    whereFilters.push(`${filter.field} NOT IN (${ninPlaceholders})`)
                    params.push(...filter.value)
                    break

                case 'gt':
                    whereFilters.push(`${filter.field} > ?`)
                    params.push(filter.value)
                    break

                case 'gte':
                    whereFilters.push(`${filter.field} >= ?`)
                    params.push(filter.value)
                    break

                case 'lt':
                    whereFilters.push(`${filter.field} < ?`)
                    params.push(filter.value)
                    break

                case 'lte':
                    whereFilters.push(`${filter.field} <= ?`)
                    params.push(filter.value)
                    break

                default:
                    throw new Error(`Unsupported operator ${filter.operator}`)
            }
        }

        if (whereFilters.length === 0) {
            return { where, params }
        }

        where += where ? ` AND ` : ` WHERE `
        where += whereFilters.join(" AND ")

        return { where, params }
    }

    static assertFiltersSchema(filters: IQueryFilter[]) {
        z.array(this.filterSchema).parse(filters)
    }

    static get filterSchema() {
        return z.object({
            field: z.string(),
            operator: z.enum(['eq', 'like', 'ne', 'in', 'nin', 'gt', 'gte', 'lt', 'lte', 'empty']),
            value: z.any()
        })
    }

}

export default SqlQueryFilter;
export { SqlQueryFilter };
