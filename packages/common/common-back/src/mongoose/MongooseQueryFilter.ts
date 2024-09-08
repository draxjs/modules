import z from "zod";
import {IDraxFieldFilter} from "@drax/common-share";


class MongooseQueryFilter{

    static applyFilters(query: object, filters: IDraxFieldFilter[]){

        this.assertQuerySchema(query)
        this.assertFiltersSchema(filters)

        for(const filter of filters){

            if(filter.value === undefined || filter.value === null) return

            switch (filter.operator) {
                case 'eq':
                    query[filter.field] = {...query[filter.field], ...{$eq:filter.value} }
                    break;
                case 'ne':
                    query[filter.field] = {...query[filter.field], ...{$ne: filter.value} }
                    break;
                case 'in':
                    if(!Array.isArray(filter.value)){
                        filter.value = filter.value.split(',').map(v => v.trim())
                    }
                    query[filter.field] = {...query[filter.field],...{$in: filter.value} }
                    break;
                case 'nin':
                    if(!Array.isArray(filter.value)){
                        filter.value = filter.value.split(',').map(v => v.trim())
                    }
                    query[filter.field] = {...query[filter.field],...{$nin: filter.value} }
                    break;
                case 'gt':
                    query[filter.field] = {...query[filter.field],...{$gt: filter.value} }
                    break;
                case 'gte':
                    query[filter.field] = {...query[filter.field],...{$gte: filter.value} }
                    break;
                case 'lt':
                    query[filter.field] = {...query[filter.field],...{$lt: filter.value} }
                    break;
                case 'lte':
                    query[filter.field] = {...query[filter.field],...{$lte: filter.value} }
                    break;
                default:
                    throw new Error(`Unsupported operator ${filter.operator}`)
            }
        }
        return query
    }

    static assertQuerySchema(query : object){
        z.object({}).parse(query)
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

export default MongooseQueryFilter;
export {MongooseQueryFilter}
