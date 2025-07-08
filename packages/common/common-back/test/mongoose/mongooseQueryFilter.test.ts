import  {test, assert, describe}  from 'vitest';
import MongooseQueryFilter from '../../src/mongoose/MongooseQueryFilter.js';
import type {IQueryFilter} from '../../src/interfaces/IQueryFilter';
import {ObjectId} from "mongodb";
import {isValidObjectId} from '../../src/utils/IsValidObjectId.js'
import {isObjectIdOrHexString} from 'mongoose'

describe('MongooseQueryFilter', () => {

    test('Apply simple filters', async () => {
        const query = {}
        const filters: IQueryFilter[] = [
            {field: 'name', operator: 'eq', value: 'John' },
        ]
        MongooseQueryFilter.applyFilters(query, filters);
        assert.deepEqual(query, { name: { $eq: 'John' } }, 'The query should have been filtered correctly');
    });

    test('Apply dual filters', async () => {
        const query = {}
        const filters: IQueryFilter[] = [
            {field: 'name', operator: 'eq', value: 'John' },
            {field: 'name', operator: 'ne', value: 'Rambo' },
        ]
        MongooseQueryFilter.applyFilters(query, filters);
        assert.deepEqual(query, { name: { $eq: 'John', $ne: 'Rambo' } }, 'The query should have been filtered correctly');
    });

    test('Should convert ISO date strings to Date objects', async () => {
        const query : any = {};
        const isoDateString = '2023-04-15T12:30:45.000Z';
        const filters = [
            { field: 'createdAt', operator: 'eq', value: isoDateString }
        ];

        MongooseQueryFilter.applyFilters(query, filters);

        assert.ok(query.createdAt.$eq instanceof Date, 'Value should be converted to a Date object');
        assert.equal(query.createdAt.$eq.toISOString(), isoDateString, 'Date value should match the original ISO string');
    });

    test('Should apply comparison operators correctly', async () => {
        const query = {}
        const filters: IQueryFilter[] = [
            {field: 'age', operator: 'gt', value: 25 },
            {field: 'score', operator: 'gte', value: 90 },
            {field: 'price', operator: 'lt', value: 100 },
            {field: 'quantity', operator: 'lte', value: 50 }
        ]

        MongooseQueryFilter.applyFilters(query, filters);

        assert.deepEqual(query, {
            age: { $gt: 25 },
            score: { $gte: 90 },
            price: { $lt: 100 },
            quantity: { $lte: 50 }
        }, 'The query should have all comparison operators applied correctly');
    });

    test('Should handle nin operator with array values', async () => {
        const query = {};
        const filters: IQueryFilter[] = [
            { field: 'categories', operator: 'nin', value: ['sports', 'news', 'entertainment'] }
        ];

        MongooseQueryFilter.applyFilters(query, filters);

        assert.deepEqual(query, {
            categories: { $nin: ['sports', 'news', 'entertainment'] }
        }, 'The query should correctly apply nin operator with array values');
    });

    test('Should handle in operator with comma-separated string values', async () => {
        const query = {};
        const filters: IQueryFilter[] = [
            { field: 'status', operator: 'in', value: 'active,pending,archived' }
        ];

        MongooseQueryFilter.applyFilters(query, filters);

        assert.deepEqual(query, {
            status: { $in: ['active', 'pending', 'archived'] }
        }, 'The query should correctly convert comma-separated string to array for in operator');
    });

    test('Should handle like operator with regex pattern', async () => {
        const query = {};
        const filters: IQueryFilter[] = [
            { field: 'name', operator: 'like', value: 'john' }
        ];

        MongooseQueryFilter.applyFilters(query, filters);

        assert.deepEqual(query, {
            name: { $regex: 'john', $options: 'i' }
        }, 'The query should correctly apply like operator with case-insensitive regex pattern');
    });

    test('Should convert valid MongoDB ObjectId strings to ObjectId objects', async () => {
        const query :any = {};
        const validObjectId = '686d1d6ec3be783b4f48e80e';
        const validObjectIdConverted = new ObjectId(validObjectId);
        const filters: IQueryFilter[] = [
            { field: 'userId', operator: 'eq', value: validObjectId }
        ];

        MongooseQueryFilter.applyFilters(query, filters);

        assert.ok(query.userId.$eq instanceof ObjectId, 'Value should be converted to an ObjectId');
        assert.equal(query.userId.$eq.toString(), validObjectId, 'ObjectId value should match the original string');

        // Test that ObjectId conversion doesn't happen for 'in' operator
        const query2 : any = {};
        const inFilters: IQueryFilter[] = [
            { field: 'userIds', operator: 'in', value: validObjectId }
        ];

        MongooseQueryFilter.applyFilters(query2, inFilters);

        // For 'in' operator, the value should be processed but remain as array of strings/ObjectIds
        assert.deepEqual(query2.userIds, { $in: [validObjectIdConverted] }, 'The query should correctly handle ObjectId with in operator');
    });


    test('Should convert valid MongoDB ObjectId strings to ObjectId', async () => {
        const query: any = {};
        const validObjectId = '686d1d6ec3be783b4f48e80e';
        const o = ObjectId.createFromHexString(validObjectId)
        console.log("o", o)
        assert.ok(o instanceof ObjectId, 'Value should be converted to an ObjectId');
    })

    test('Should 25  valid MongoDB ObjectId strings', async () => {
        const twentyfiveObjectId = 25;
        let isValid = false;
        if(isValidObjectId(25)){
            isValid = true
        }
        assert.equal(isValid, false, 'Value should not be a valid ObjectId');
    })


})
