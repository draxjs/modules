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
        let andConditions: string[] = []
        const orGroups = new Map<string, { sql: string, params: any[] }[]>()

        for (const filter of filters) {
            const condition = this.buildCondition(filter)

            if (!condition) {
                continue
            }

            if (filter.orGroup) {
                const group = orGroups.get(filter.orGroup) || []
                group.push(condition)
                orGroups.set(filter.orGroup, group)
                continue
            }

            andConditions.push(condition.sql)
            params.push(...condition.params)
        }

        for (const groupConditions of orGroups.values()) {
            const sql = groupConditions.map(condition => condition.sql).join(" OR ")
            andConditions.push(`(${sql})`)

            for (const condition of groupConditions) {
                params.push(...condition.params)
            }
        }

        if (andConditions.length === 0) {
            return { where, params }
        }

        where += where ? ` AND ` : ` WHERE `
        where += andConditions.join(" AND ")

        return { where, params }
    }

    static buildCondition(filter: IQueryFilter): { sql: string, params: any[] } | null {
        if ((filter.value === undefined || filter.value === null) && filter.operator !== 'empty') {
            return null
        }

        switch (filter.operator) {
            case 'like':
                return {
                    sql: `${filter.field} LIKE ?`,
                    params: [`%${filter.value}%`]
                }
            case 'eq':
                return {
                    sql: `${filter.field} = ?`,
                    params: [filter.value]
                }
            case 'ne':
                return {
                    sql: `${filter.field} != ?`,
                    params: [filter.value]
                }
            case 'empty':
                return {
                    sql: `(${filter.field} IS NULL OR ${filter.field} = '')`,
                    params: []
                }
            case 'in': {
                const values = this.normalizeArrayValue(filter.value)
                const placeholders = values.map(() => '?').join(',')

                return {
                    sql: `${filter.field} IN (${placeholders})`,
                    params: values
                }
            }
            case 'nin': {
                const values = this.normalizeArrayValue(filter.value)
                const placeholders = values.map(() => '?').join(',')

                return {
                    sql: `${filter.field} NOT IN (${placeholders})`,
                    params: values
                }
            }
            case 'gt':
                return {
                    sql: `${filter.field} > ?`,
                    params: [filter.value]
                }
            case 'gte':
                return {
                    sql: `${filter.field} >= ?`,
                    params: [filter.value]
                }
            case 'lt':
                return {
                    sql: `${filter.field} < ?`,
                    params: [filter.value]
                }
            case 'lte':
                return {
                    sql: `${filter.field} <= ?`,
                    params: [filter.value]
                }
            default:
                throw new Error(`Unsupported operator ${filter.operator}`)
        }
    }

    static normalizeArrayValue(value: any): any[] {
        return Array.isArray(value)
            ? value
            : value.split(',').map((item: string) => item.trim())
    }

    static assertFiltersSchema(filters: IQueryFilter[]) {
        z.array(this.filterSchema).parse(filters)
    }

    static get filterSchema() {
        return z.object({
            field: z.string(),
            operator: z.enum(['eq', 'like', 'ne', 'in', 'nin', 'gt', 'gte', 'lt', 'lte', 'empty']),
            value: z.any(),
            orGroup: z.string().optional()
        })
    }

}

export default SqlQueryFilter;
export { SqlQueryFilter };
