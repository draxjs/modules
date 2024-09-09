import z from "zod";
import {IDraxFieldFilter} from "@drax/common-share";


class SqlQueryFilter {

    static applyFilters(where: string = "", filters: IDraxFieldFilter[]){
        if(filters.length === 0) return where

        where += where ? ` AND ` : ` WHERE `
        let whereFilters= []
        this.assertFiltersSchema(filters)

        for(const filter of filters){

            if(filter.value === undefined || filter.value === null) return

            switch (filter.operator) {
                case 'eq':
                    whereFilters.push(` ${filter.field} = '${filter.value}' `)
                    break;
                case 'ne':
                    whereFilters.push(` ${filter.field} != '${filter.value}' `)
                    break;
                case 'in':
                    if(Array.isArray(filter.value)){
                        filter.value = filter.value.map(v => `'${v}'`  ).join(',')
                    }
                    whereFilters.push(` ${filter.field} IN (${filter.value}) `)
                    break;
                case 'nin':
                    if(Array.isArray(filter.value)){
                        filter.value = filter.value.map(v => `'${v}'`  ).join(',')
                    }
                    whereFilters.push(` ${filter.field} NOT IN (${filter.value}) `)
                    break;
                case 'gt':
                    whereFilters.push(` ${filter.field} > '${filter.value}' `)
                    break;
                case 'gte':
                    whereFilters.push(` ${filter.field} >= '${filter.value}' `)
                    break;
                case 'lt':
                    whereFilters.push(` ${filter.field} < '${filter.value}' `)
                    break;
                case 'lte':
                    whereFilters.push(` ${filter.field} <= '${filter.value}' `)
                    break;
                default:
                    throw new Error(`Unsupported operator ${filter.operator}`)
            }
        }
        where += whereFilters.join(" AND ")
        return where
    }

    static assertFiltersSchema(filters : IDraxFieldFilter[]){
        z.array(this.filterSchema).parse(filters)
    }

    static  get filterSchema(){
        return z.object({
            field: z.string(),
            operator: z.enum(['eq', 'ne', 'in', 'nin','gt', 'gte', 'lt', 'lte']),
            value: z.any()
        })
    }

}

export default SqlQueryFilter;
export {SqlQueryFilter}