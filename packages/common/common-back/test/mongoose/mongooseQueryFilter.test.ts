import  test  from 'node:test';
import assert from 'node:assert/strict';
import MongooseQueryFilter from '../../src/mongoose/MongooseQueryFilter.js';
import type {IMongooseFilter} from '../../src/mongoose/MongooseQueryFilter.js';

test('Apply simple filters', async () => {
    const query = {}
    const filters: IMongooseFilter[] = [
        {field: 'name', operator: 'eq', value: 'John' },
    ]
    MongooseQueryFilter.applyFilters(query, filters);
    assert.deepEqual(query, { name: { $eq: 'John' } }, 'The query should have been filtered correctly');
});

test('Apply dual filters', async () => {
    const query = {}
    const filters: IMongooseFilter[] = [
        {field: 'name', operator: 'eq', value: 'John' },
        {field: 'name', operator: 'ne', value: 'Rambo' },
    ]
    MongooseQueryFilter.applyFilters(query, filters);
    assert.deepEqual(query, { name: { $eq: 'John', $ne: 'Rambo' } }, 'The query should have been filtered correctly');
});
