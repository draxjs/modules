import z from "zod";
import type {IQueryFilter} from "../interfaces/IQueryFilter";
import { ObjectId } from 'mongodb'

import {isValidIsoDate} from '../utils/IsValidIsoDate.js'
import {isValidObjectId} from '../utils/IsValidObjectId.js'
import {BadRequestError} from "../errors/BadRequestError.js";
import { Model } from "mongoose"

type MongooseQuery = Record<string, any>

class MongooseQueryFilter{

    static applyFilters<T>(query: object, filters: IQueryFilter[], model?: Model<T>){
        if(!filters || filters.length === 0){
            return query;
        }
        this.assertQuerySchema(query)
        this.assertFiltersSchema(filters)

        function isSchemaTypeObjectId(fieldName: string){
            if(model){
                const schemaType = model.schema.path(fieldName)
                if(schemaType?.instance === 'ObjectId'){
                    return true
                }else{
                    return false
                }
            }else{
                return false
            }
        }

        const mutableQuery = query as MongooseQuery
        const existingCondition = Object.keys(mutableQuery).length > 0 ? {...mutableQuery} : null

        for(const key of Object.keys(mutableQuery)){
            delete mutableQuery[key]
        }

        const andConditions: MongooseQuery[] = []
        const orGroups = new Map<string, MongooseQuery[]>()

        for(const filter of filters){
            const condition = this.buildCondition(filter, isSchemaTypeObjectId)

            if(!condition){
                continue
            }

            if(filter.orGroup){
                const group = orGroups.get(filter.orGroup) || []
                group.push(condition)
                orGroups.set(filter.orGroup, group)
                continue
            }

            andConditions.push(condition)
        }

        const finalConditions: MongooseQuery[] = []

        if(existingCondition){
            finalConditions.push(existingCondition)
        }

        finalConditions.push(...andConditions)

        for(const groupConditions of orGroups.values()){
            if(groupConditions.length === 1){
                finalConditions.push(groupConditions[0])
            }else if(groupConditions.length > 1){
                finalConditions.push({$or: groupConditions})
            }
        }

        if(finalConditions.length === 1){
            Object.assign(mutableQuery, finalConditions[0])
            return query
        }

        if(finalConditions.length > 1){
            mutableQuery.$and = finalConditions
        }

        return query
    }

    static buildCondition(
        filter: IQueryFilter,
        isSchemaTypeObjectId: (fieldName: string) => boolean
    ): MongooseQuery | null {
        let value = filter.value

        if(isValidIsoDate(value)){
            value = new Date(value)
        }

        const isObjectId = isSchemaTypeObjectId(filter.field)

        if(filter.field === '_id' && !isValidObjectId(value)){
            throw new BadRequestError('Invalid ObjectId','error.invalidId')
        }

        if(isObjectId && !isValidObjectId(value)  && !['in', 'nin','empty'].includes(filter.operator)){
            throw new BadRequestError('Invalid ObjectId','error.invalidId')
        }

        if(isValidObjectId(value) && !['in', 'nin','empty'].includes(filter.operator)){
            value = ObjectId.createFromHexString(value)
        }

        if((value === undefined || value === null) && filter.operator !== 'empty'){
            return null
        }

        if(value === 'true'){
            value = true
        }

        if(value === 'false'){
            value = false
        }

        switch (filter.operator) {
            case 'empty':
                return isObjectId
                    ? {[filter.field]: null}
                    : {[filter.field]: {$in: [null, ""]}}
            case 'like':
                return {[filter.field]: {$regex: value, $options: 'i'}}
            case 'eq':
                return {[filter.field]: {$eq: value}}
            case 'ne':
                return {[filter.field]: {$ne: value}}
            case 'in':
                return {[filter.field]: {$in: this.normalizeArrayValue(value)}}
            case 'nin':
                return {[filter.field]: {$nin: this.normalizeArrayValue(value)}}
            case 'gt':
                return {[filter.field]: {$gt: value}}
            case 'gte':
                return {[filter.field]: {$gte: value}}
            case 'lt':
                return {[filter.field]: {$lt: value}}
            case 'lte':
                return {[filter.field]: {$lte: value}}
            default:
                throw new Error(`Unsupported operator ${filter.operator}`)
        }
    }

    static normalizeArrayValue(value: any): any[] {
        const values = Array.isArray(value)
            ? value
            : value.split(',').map((item: string) => item.trim())

        return values.map((item: string) =>
            isValidObjectId(item) ? ObjectId.createFromHexString(item) : item
        )
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
            operator: z.enum(['eq','like','ne', 'in', 'nin','gt', 'gte', 'lt', 'lte','empty']),
            value: z.any(),
            orGroup: z.string().optional()
        })
    }

}

export default MongooseQueryFilter;
export {MongooseQueryFilter}
