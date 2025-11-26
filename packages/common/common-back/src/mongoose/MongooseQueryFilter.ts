import z from "zod";
import type {IQueryFilter} from "../interfaces/IQueryFilter";
import { ObjectId } from 'mongodb'

import {isValidIsoDate} from '../utils/IsValidIsoDate.js'
import {isValidObjectId} from '../utils/IsValidObjectId.js'


class MongooseQueryFilter{

    static applyFilters(query: object, filters: IQueryFilter[]){
        if(!filters || filters.length === 0){
            return query;
        }
        this.assertQuerySchema(query)
        this.assertFiltersSchema(filters)

        for(const filter of filters){


            //Valid date
            if(isValidIsoDate(filter.value)){
                filter.value = new Date(filter.value)
            }

            //Valid ObjectId
            if(isValidObjectId(filter.value) && !['in', 'nin'].includes(filter.operator)){
                filter.value = ObjectId.createFromHexString(filter.value)
            }

            if(filter.value === undefined || filter.value === null) return

            switch (filter.operator) {
                case 'like':
                    query[filter.field] = {...query[filter.field], ... {$regex: filter.value, $options: 'i'} }
                    break;
                case 'eq':
                    query[filter.field] = {...query[filter.field], ...{$eq:filter.value} }
                    break;
                case 'ne':
                    query[filter.field] = {...query[filter.field], ...{$ne: filter.value} }
                    break;
                case 'in':
                    if(!Array.isArray(filter.value)){
                        filter.value = filter.value.split(',').map(v => v.trim())
                        filter.value = filter.value.map(
                            (value:string) =>
                                isValidObjectId(value) ? ObjectId.createFromHexString(value): value
                        )
                    }
                    query[filter.field] = {...query[filter.field],...{$in: filter.value} }
                    break;
                case 'nin':
                    if(!Array.isArray(filter.value)){
                        filter.value = filter.value.split(',').map(v => v.trim())
                        filter.value = filter.value.map(
                            (value:string) =>
                                isValidObjectId(value) ? ObjectId.createFromHexString(value): value
                        )
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
        console.log("applyFilters Query", query)
        return query
    }

    static assertQuerySchema(query : object){
        z.object({}).parse(query)
    }

    static assertFiltersSchema(filters : IQueryFilter[]){
        z.array(this.filterSchema).parse(filters)
    }

    static  get filterSchema(){
        return z.object({
            field: z.string(),
            operator: z.enum(['eq','like','ne', 'in', 'nin','gt', 'gte', 'lt', 'lte']),
            value: z.any()
        })
    }

}

export default MongooseQueryFilter;
export {MongooseQueryFilter}
